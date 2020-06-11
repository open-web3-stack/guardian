import Handlebars from 'handlebars';
import fs from 'fs';

const getConfig = async () => {
  return {
    ethereum: [
      {
        name: 'syntheticPoolGeneral',
        id: '0x61A7645ef693Ea7740b121232Ddc7b874Be7Fa09',
        tokenNames: ['FEUR', 'FJPY', 'FCAD', 'FCHF', 'FGBP', 'FAUD', 'FOIL', 'FXAU', 'FBTC', 'FETH'],
        maxCollateralRatio: 0.8,
      },
      {
        name: 'syntheticPoolXYZ',
        id: '0x2b1627CFF4Eb38C774Ec1008045CEd2C4776eEf6',
        tokenNames: ['FEUR', 'FJPY', 'FCAD', 'FCHF', 'FGBP', 'FAUD', 'FOIL', 'FXAU', 'FBTC', 'FETH'],
        maxCollateralRatio: 0.8,
      },
    ],
  };
};

const run = async () => {
  const config = await getConfig();

  const template = Handlebars.compile(fs.readFileSync(`${__dirname}/config.yml.hbs`, 'utf-8'));

  fs.writeFileSync(`${__dirname}/config.yml`, template(config));

  console.log('write to config.yaml successfully');
};

run();
