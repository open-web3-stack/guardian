import { ActionRegistry } from '@open-web3/guardian';
import { setDefaultConfig } from '../utils';
import { config as getConfig } from './config';
import nodemailer from 'nodemailer';

const sendEmail = async (value: string) => {
  const testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: 'bar@example.com, baz@example.com', // list of receivers
      subject: 'Staking Reward ✔', // Subject line
      text: `Staking Reward ${value}` // plain text body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch {
    console.log('Message sent failed');
  }
};

export default async () => {
  setDefaultConfig('staking.yml');

  ActionRegistry.register('stakingReward', (_, data) => {
    const config = getConfig();
    const stash = data.args['stash'] || data.args['0'];
    const amount = data.args['amount'] || data.args['1'];
    if (config.address === stash) {
      sendEmail(amount);
    }
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
