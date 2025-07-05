module.exports = {
    createTransport: () => ({
      sendMail: (options, callback) => {
        callback(null, { response: 'E-mail simulado enviado com sucesso!' });
      }
    })
  };
  