export const reorder = <T,>(list: T[], oldIndex: number, newIndex: number): T[] => {
  if (
    oldIndex === newIndex ||
    oldIndex < 0 ||
    newIndex < 0 ||
    oldIndex >= list.length ||
    newIndex >= list.length
  ) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(oldIndex, 1);

  if (moved === undefined) {
    return list;
  }

  next.splice(newIndex, 0, moved);
  return next;
};
