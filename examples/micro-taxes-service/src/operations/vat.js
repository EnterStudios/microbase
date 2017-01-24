module.exports = (base) => ({
  handler: (msg, reply) => {
    base.services.call({ name: 'math:multiply' }, { left: msg.net, right: 0.21 })
      .then((result) => {
        return reply(base.utils.genericResponse({ data: result.answer, calcsBy: result.host }));
      })
      .catch(error => reply(base.utils.genericResponse(null, error)));
  }
});
