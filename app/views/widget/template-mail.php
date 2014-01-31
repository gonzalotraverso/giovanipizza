<head></head>
<body>
  <table style='border:0;border-spacing:0;border-collapse:collapse'>
  <tr>
    <td><img style='margin-right:10px' src='<?= res_url() ?>logo-mail.png'><br /></td>
    <td style='vertical-align:top'>
      <h2 style='margin-bottom:5px'>Consulta realizada por web</h2>
      <div style='margin-bottom:3px'><b>Fecha</b> <?= date('d-m-Y') ?></div>
      <div style='margin-bottom:3px'><b>Nombre y Apellido</b> <?= $this->input->post('name') ?></div>
      <div style='margin-bottom:3px'><b>E-mail</b> <?= $this->input->post('mail') ?></div>
      <div style='margin-bottom:3px'><b>Fecha del evento</b> <?= $this->input->post('event') ?></div>
      <div style='margin-bottom:3px'><b>Teléfono</b> <?= $this->input->post('tel') ?></div>
      <div style='margin-bottom:3px'><b>Consulta</b></div>
      <div style='margin-bottom:3px'><?= nl2br($this->input->post('comments')) ?></div>
    </td>
  </tr>
  </table>
</body>