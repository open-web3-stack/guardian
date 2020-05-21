import Joi from '@hapi/joi';

// TODO: update me
const schema = Joi.object({
  version: '0.1',
  guardians: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      networkType: Joi.valid('laminarChain', 'acalaChain', 'substrateChain', 'ethereum').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())),
      monitors: Joi.object()
        .pattern(
          Joi.string(),
          Joi.object({
            task: Joi.string().required(),
            arguments: Joi.any(),
            conditions: Joi.any(),
            actions: Joi.any(),
          })
        )
        .required(),
    })
      .when(Joi.object({ networkType: 'laminarChain' }).unknown(), {
        then: Joi.object({
          network: Joi.string().valid('dev', 'turbulence', 'reynolds', 'mainnet').required(),
        }),
      })
      .when(Joi.object({ networkType: 'acalaChain' }).unknown(), {
        then: Joi.object({
          network: Joi.string().valid('dev', 'karura', 'mainnet').required(),
        }),
      })
      .when(Joi.object({ networkType: 'ethereum' }).unknown(), {
        then: Joi.object({
          network: Joi.string().valid('dev', 'kovan', 'mainnet').required(),
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
