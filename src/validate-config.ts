import joi from "@hapi/joi";

// TODO:
const schema = joi.object({
  version: "0.1",
  guardians: joi.object().pattern(
    joi.string(),
    joi
      .object({
        "network-type": joi.valid("laminarChain", "ethereum").required(),
        "node-url": joi.string(),
        monitors: joi
          .object()
          .pattern(
            joi.string(),
            joi.object({
              protocol: joi.valid("synthetic", "margin").required(),
              webhook: joi.string(),
              script: joi.string(),
            })
          )
          .required(),
      })
      .when(joi.object({ "network-type": "laminarChain" }).unknown(), {
        then: joi.object({
          network: joi
            .string()
            .valid("dev", "turbulence", "reynolds", "mainnet")
            .required(),
        }),
      })
      .when(joi.object({ "network-type": "ethereum" }).unknown(), {
        then: joi.object({
          network: joi.string().valid("dev", "kovan", "mainnet").required(),
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
    console.warn("Config warning: ", warning);
  }

  return value;
};
