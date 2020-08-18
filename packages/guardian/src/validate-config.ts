import Joi from 'joi';

const schema = Joi.object({
  version: '0.1',
  guardians: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      networkType: Joi.string().required(),
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
    }).unknown()
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
