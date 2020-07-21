export default () => {
  const nodeEndpoint = process.env.NODE_ENDPOINT;

  if (!nodeEndpoint) throw Error('process.env.NODE_ENDPOINT is missing');

  return { nodeEndpoint };
};
