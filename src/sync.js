// Decides what to upload, delete and keep so every device ends up with the same orders.
// "synced" = ids this device has already exchanged with the cloud before.
//
//  in synced | in cloud | on this device | meaning
//  ----------+----------+----------------+--------------------------------------
//     no     |   yes    |      no        | new from another device  -> add here
//     no     |   no     |      yes       | new on this device       -> upload
//     yes    |   yes    |      no        | deleted on this device   -> delete in cloud
//     yes    |   no     |      yes       | deleted on another device -> remove here

export function planSync(cloud, local, synced) {
  const cloudIds = new Set(cloud.map((o) => o.id));
  const localIds = new Set(local.map((o) => o.id));
  const toPush = local.filter((o) => !cloudIds.has(o.id) && !synced.has(o.id));
  const toDelete = [...synced].filter((id) => cloudIds.has(id) && !localIds.has(id));
  return { toPush, toDelete };
}

// `latest` is the order list right now (it may have changed while the network calls ran).
export function mergeAfterSync(cloud, latest, synced, toPush, toDelete) {
  const latestIds = new Set(latest.map((o) => o.id));
  const deleted = new Set(toDelete);
  const cloudIds = new Set(cloud.map((o) => o.id));
  const pushed = new Set(toPush.map((o) => o.id));
  const merged = new Map();
  const deleteNextRound = new Set();

  for (const o of cloud) {
    if (deleted.has(o.id)) continue;
    if (synced.has(o.id) && !latestIds.has(o.id)) {
      deleteNextRound.add(o.id); // deleted here while syncing: remove it from the cloud next round
      continue;
    }
    merged.set(o.id, o);
  }
  for (const o of toPush) merged.set(o.id, o);
  for (const o of latest) {
    if (!merged.has(o.id) && !synced.has(o.id)) merged.set(o.id, o); // added while syncing, uploaded next round
  }

  const newSynced = new Set([...merged.keys()].filter((id) => cloudIds.has(id) || pushed.has(id)));
  deleteNextRound.forEach((id) => newSynced.add(id)); // keep them "known" so the next round deletes them
  return {
    merged: [...merged.values()].sort((a, b) => b.id - a.id),
    newSynced,
    needsAnotherRound: deleteNextRound.size > 0,
  };
}
