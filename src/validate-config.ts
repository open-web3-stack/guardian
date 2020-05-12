import joi from '@hapi/joi';

// TODO: update me
const schema = joi.object({
  version: '0.1',
  guardians: joi.object().pattern(
    joi.string(),
    joi
      .object({
        networkType: joi.valid('laminarChain', 'acalaChain', 'substrateChain', 'ethereum').required(),
        nodeEndpoint: joi.alt(joi.string(), joi.array().items(joi.string())),
        monitors: joi
          .object()
          .pattern(
            joi.string(),
            joi.object({
              task: joi.string().required(),
              arguments: joi.any(),
              conditions: joi.any(),
              actions: joi.any(),
            })
          )
          .required(),
      })
      .when(joi.object({ networkType: 'laminarChain' }).unknown(), {
        then: joi.object({
          network: joi.string().valid('dev', 'turbulence', 'reynolds', 'mainnet').required(),
        }),
      })
      .when(joi.object({ networkType: 'acalaChain' }).unknown(), {
        then: joi.object({
          network: joi.string().valid('dev', 'karura', 'mainnet').required(),
        }),
      })
      .when(joi.object({ networkType: 'ethereum' }).unknown(), {
        then: joi.object({
          network: joi.string().valid('dev', 'kovan', 'mainnet').required(),
        }),
      })
  ),
});

export default (config: any): any => {
  const { error, warning, value } = schema.validate(config);

  if (error) {
    throw error;
  }

  if (warning) {
    console.warn('Config warning: ', warning);
  }

  return value;
};
