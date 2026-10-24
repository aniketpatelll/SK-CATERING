import { useCallback, useEffect, useRef, useState } from "react";
import { loadOrders, saveOrders, loadSynced, saveSynced } from "./orders";
import { cloudEnabled, fetchOrders, pushOrder, deleteOrders } from "./cloud";
import { planSync, mergeAfterSync } from "./sync";

const POLL_MS = 15000; // look for orders from other devices every 15 seconds

const sameIds = (a, b) => a.length === b.length && a.every((o, i) => o.id === b[i].id);

// Orders list that is saved on this device and, when data/cloud.json is filled in,
// shared with every other device.  status: local | syncing | synced | offline
export default function useOrders() {
  const [orders, setOrders] = useState(loadOrders);
  const [status, setStatus] = useState(cloudEnabled ? "syncing" : "local");

  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const synced = useRef(loadSynced());
  const running = useRef(false);
  const again = useRef(false);

  const sync = useCallback(async () => {
    if (!cloudEnabled) return;
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    try {
      do {
        again.current = false;
        const cloud = (await fetchOrders()).filter((o) => o && o.id != null);
        const { toPush, toDelete } = planSync(cloud, ordersRef.current, synced.current);
        for (const o of toPush) await pushOrder(o);
        await deleteOrders(toDelete);

        const { merged, newSynced, needsAnotherRound } = mergeAfterSync(
          cloud,
          ordersRef.current,
          synced.current,
          toPush,
          toDelete
        );
        synced.current = newSynced;
        saveSynced(newSynced);
        if (needsAnotherRound) again.current = true;
        if (!sameIds(ordersRef.current, merged)) {
          ordersRef.current = merged;
          setOrders(merged);
        }
      } while (again.current);
      setStatus("synced");
    } catch {
      setStatus("offline"); // saved on this device, retried automatically
    } finally {
      running.current = false;
    }
  }, []);

  // keep a copy on this device and sync soon after every change
  useEffect(() => {
    saveOrders(orders);
    if (!cloudEnabled) return;
    const t = setTimeout(sync, 400);
    return () => clearTimeout(t);
  }, [orders, sync]);

  // pick up orders from other devices
  useEffect(() => {
    if (!cloudEnabled) return;
    const tick = () => !document.hidden && sync();
    const id = setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    window.addEventListener("online", tick);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", tick);
      window.removeEventListener("online", tick);
    };
  }, [sync]);

  return { orders, setOrders, status };
}
