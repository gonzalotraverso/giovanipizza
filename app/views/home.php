<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-home">
  <div class="content">
    <div class="content-inside">
      <h1>Quienes Somos</h1>
      <div class="info">
        <p>Somos una empresa especializada en brindar el mejor servicio de catering para reuniones sociales y eventos empresariales.</p>
        <p>Nuestra materia prima, productos y personal marcan la diferencia por la óptima calidad y distinción. Ofrecemos un servicio de vanguardia y somos pioneros en Pizza Party. </p>
        <p>Los ocho años de trayectoria, así como la fidelidad de los clientes, avalan nuestro compromiso y trabajo.</p>
      </div>
    </div>
  </div>
</div>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>