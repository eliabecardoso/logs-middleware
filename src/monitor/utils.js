const valueTypeofs = {
  bool: (v) => v === 'true',
  number: (v) => Number(v),
  array: (v) => new Array(...v),
  any: (v) => v,
};

exports.transformStringToKeyValue = (
  input,
  valueTypeof = 'bool',
  { separate = ';', keyValueSeparate = '=' } = {}
) => {
  if (!input || typeof input !== 'string') return;
  const keyValues = input.split(separate);

  return keyValues.reduce((acc, cur) => {
    const kV = cur.split(keyValueSeparate);
    return {
      ...acc,
      [kV[0].trim()]: valueTypeofs[valueTypeof](kV[1].trim()),
    };
  }, {});
};
