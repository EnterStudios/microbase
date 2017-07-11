module.exports = (base) => ({
  handler: (msg, reply) => {
    const result = msg.left / msg.right;
    return reply(base.utils.genericResponse({ answer: result, host: process.env.HOSTNAME }));
  }
});
