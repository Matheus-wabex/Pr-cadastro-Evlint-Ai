
const formularioPreCadastro = document.querySelector(
  "#formulario-pre-cadastro"
);

const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoWhatsapp = document.querySelector("#whatsapp");

const botaoEnvio = document.querySelector("#botao-envio");
const mensagemFormulario = document.querySelector(
  "#mensagem-formulario"
);

const NUMERO_WHATSAPP = "554396159550";

function gerarUrlWhatsApp(nome, email, telefone) {
    const mensagem = `Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}`;

    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}
const PAGINA_CONFIRMACION = "cadastro.html";

const CHAVE_ESTADO = "EVILINT-AI";
const CHAVE_RETORNO = "EVILINT-AI-retorno";

const TEXTO_BOTAO_ORIGINAL =
  "Quero minha demonstração gratuita";

let temporizadorRecuperacao = null;


function obterNumeroWhatsapp(valor) {
  let numeros = valor.replace(/\D/g, "");

  if (
    numeros.startsWith("55") &&
    (numeros.length === 12 || numeros.length === 13)
  ) {
    numeros = numeros.slice(2);
  }

  return numeros;
}


function formatarWhatsapp(valor) {
  const numeros = obterNumeroWhatsapp(valor).slice(0, 11);

  if (numeros.length < 3) {
    return numeros.length > 0 ? `(${numeros}` : "";
  }

  const codigoArea = numeros.slice(0, 2);
  const numeroLocal = numeros.slice(2);

  const parteInicial =
    numeroLocal.length > 8
      ? numeroLocal.slice(0, 5)
      : numeroLocal.slice(0, 4);

  const parteFinal =
    numeroLocal.length > 8
      ? numeroLocal.slice(5)
      : numeroLocal.slice(4);

  return `(${codigoArea}) ${parteInicial}${
    parteFinal ? `-${parteFinal}` : ""
  }`;
}



function definirErro(campo, texto) {
  const campoErro = document.querySelector(`#erro-${campo.id}`);

  campo.setAttribute(
    "aria-invalid",
    texto ? "true" : "false"
  );

  if (campoErro) {
    campoErro.textContent = texto;
  }
}



function validarFormulario() {
  let formularioValido = true;

  const nome = campoNome.value.trim();
  const email = campoEmail.value.trim();
  const whatsapp = obterNumeroWhatsapp(campoWhatsapp.value);

  definirErro(campoNome, "");
  definirErro(campoEmail, "");
  definirErro(campoWhatsapp, "");

  if (!nome) {
    definirErro(campoNome, "Informe seu nome.");
    formularioValido = false;
  }

  if (!email) {
    definirErro(campoEmail, "Informe seu e-mail.");
    formularioValido = false;
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    definirErro(campoEmail, "Informe um e-mail válido.");
    formularioValido = false;
  }

  if (!whatsapp) {
    definirErro(campoWhatsapp, "Informe seu WhatsApp.");
    formularioValido = false;
  } else if (!/^\d{10,11}$/.test(whatsapp)) {
    definirErro(
      campoWhatsapp,
      "Informe um número com DDD e 10 ou 11 dígitos."
    );

    formularioValido = false;
  }

  if (!formularioValido) {
    mensagemFormulario.textContent =
      "Confira os campos destacados para continuar.";

    const primeiroCampoInvalido =
      formularioPreCadastro.querySelector(
        '[aria-invalid="true"]'
      );

    primeiroCampoInvalido?.focus();
  }

  return formularioValido;
}


function restaurarBotao() {
  if (temporizadorRecuperacao !== null) {
    clearTimeout(temporizadorRecuperacao);
    temporizadorRecuperacao = null;
  }

  botaoEnvio.disabled = false;
  botaoEnvio.textContent = TEXTO_BOTAO_ORIGINAL;
}



function confirmarRetornoDoWhatsapp() {
  if (document.visibilityState !== "visible") {
    return;
  }

  try {
    const estado = sessionStorage.getItem(CHAVE_ESTADO);
    const retornoDetectado = sessionStorage.getItem(CHAVE_RETORNO);

    if (
      estado === "aguardando-whatsapp" &&
      retornoDetectado === "sim"
    ) {
      sessionStorage.setItem(CHAVE_ESTADO, "confirmada");

    
      sessionStorage.removeItem(CHAVE_RETORNO);

      window.location.replace(PAGINA_CONFIRMACION);
    }
  } catch {
    mensagemFormulario.textContent =
      "Não foi possível verificar o retorno do WhatsApp nesta sessão.";

    restaurarBotao();
  }
}


document.addEventListener("visibilitychange", () => {
  try {
    const estado = sessionStorage.getItem(CHAVE_ESTADO);

    if (
      document.visibilityState === "hidden" &&
      estado === "aguardando-whatsapp"
    ) {
      // Registra que a página saiu de primeiro plano.
      sessionStorage.setItem(CHAVE_RETORNO, "sim");
      return;
    }

    if (document.visibilityState === "visible") {
      confirmarRetornoDoWhatsapp();
    }
  } catch {
    mensagemFormulario.textContent =
      "Não foi possível verificar o retorno do WhatsApp.";

    restaurarBotao();
  }
});




window.addEventListener("pageshow", () => {
  confirmarRetornoDoWhatsapp();
});



campoWhatsapp.addEventListener("input", () => {
  campoWhatsapp.value = formatarWhatsapp(
    campoWhatsapp.value
  );

  if (campoWhatsapp.hasAttribute("aria-invalid")) {
    definirErro(campoWhatsapp, "");
  }
});

[campoNome, campoEmail].forEach((campo) => {
  campo.addEventListener("input", () => {
    if (campo.hasAttribute("aria-invalid")) {
      definirErro(campo, "");
    }
  });
});




formularioPreCadastro.addEventListener("submit", (evento) => {
  evento.preventDefault();

  mensagemFormulario.textContent = "";

  if (!validarFormulario()) {
    return;
  }

  if (botaoEnvio.disabled) {
    return;
  }

  try {
    sessionStorage.setItem(
      CHAVE_ESTADO,
      "aguardando-whatsapp"
    );

    sessionStorage.removeItem(CHAVE_RETORNO);
  } catch {
    mensagemFormulario.textContent =
      "Não foi possível iniciar o processo. Verifique as configurações do navegador.";

    return;
  }

  botaoEnvio.disabled = true;
  botaoEnvio.textContent = "Abrindo o WhatsApp…";

  temporizadorRecuperacao = setTimeout(() => {
    if (document.visibilityState === "visible") {
      try {
        if (
          sessionStorage.getItem(CHAVE_ESTADO) ===
          "aguardando-whatsapp"
        ) {
          sessionStorage.removeItem(CHAVE_ESTADO);
          sessionStorage.removeItem(CHAVE_RETORNO);
        }
      } catch {
      }

      restaurarBotao();

      mensagemFormulario.textContent =
        "Se o WhatsApp não abriu, tente novamente.";
    }
  }, 10000);

  const nome = campoNome.value.trim();
const email = campoEmail.value.trim();
const telefone = campoWhatsapp.value.trim();

const URL_WHATSAPP = gerarUrlWhatsApp(nome, email, telefone);

window.open(URL_WHATSAPP, "_blank", "noopener,noreferrer");
});
