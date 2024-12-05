const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

app.use(bodyParser.json());

app.post("/amigo-invisible", async (req, res) => {
  const participantes = req.body.participantes;

  if (!participantes || participantes.length < 3) {
    return res
      .status(400)
      .json({ error: "Se necesitan al menos 3 participantes." });
  }

  const asignaciones = generarAsignaciones(participantes.map((p) => p.name));
  if (!asignaciones) {
    return res
      .status(500)
      .json({ error: "No se pudieron generar asignaciones válidas." });
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado con éxito:", info.response);
    }
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  try {
    for (const [remitente, destinatario] of Object.entries(asignaciones)) {
      const email = participantes.find((p) => p.name === remitente).email;
      await enviarCorreo(transporter, email, remitente, destinatario);
    }

    res.json({ message: "Correos enviados correctamente." });
  } catch (error) {
    console.error("Error al enviar correos:", error);
    res.status(500).json({ error: "Error al enviar los correos." });
  }
});

function generarAsignaciones(nombres) {
  const shuffled = [...nombres];
  let intentos = 0;

  while (intentos < 100) {
    shuffled.sort(() => Math.random() - 0.5);

    if (shuffled.every((nombre, i) => nombre !== nombres[i])) {
      return Object.fromEntries(
        nombres.map((nombre, i) => [nombre, shuffled[i]])
      );
    }
    intentos++;
  }
  return null;
}

async function enviarCorreo(transporter, email, remitente, destinatario) {
  const info = await transporter.sendMail({
    from: '"Amigo Invisible" <sorteoamigoinvisible2024@gmail.com>',
    to: email,
    subject: "Tu amigo invisible 🎁",
    text: `Hola ${remitente}, tu amigo invisible es: ${destinatario}. 🎁 Recuerda, el objetivo es hacer que a tu amigo invisible le guste tu regalo. 🧠💡 ¡Que sea un regalo pensado con el corazón! 💖 Eso sí, que nadie descubra a su amigo invisible... ¡mantén el misterio hasta el final! 😜
    El presupuesto máximo es de 5€ 💸, pero lo más importante es el detalle y las ganas de sorprender. ¡No olvides que el regalo debe ser algo divertido, original o personalizado! 🌟 Cuida cada detalle para hacer sentir especial a la persona que te ha tocado.
    ¡Vamos al ataque! 💪✨`,
  });
  console.log("Correo enviado:", info.messageId);
}

app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
