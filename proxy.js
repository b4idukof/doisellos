export default async function handler(req, res) {
  const { barbeiro, data } = req.query;

  const url = `http://ice-club.my/get_agenda.php?barbeiro=${barbeiro}&data=${data}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ erro: "Erro ao consultar agenda." });
  }
}
