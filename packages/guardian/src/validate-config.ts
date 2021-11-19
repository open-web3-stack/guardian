import Joi from 'joi';

const schema = Joi.object({
  version: '0.1',
  guardians: Joi.array()
    .min(1)
    .items(
      Joi.object({
        chain: Joi.string(),
        monitors: Joi.array()
          .min(1)
          .items(
            Joi.object({
              task: Joi.string().required(),
              id: Joi.string(),
              arguments: Joi.any(),
              conditions: Joi.any(),
              actions: Joi.any()
            })
          )
          .required()
      }).unknown()
    )
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
