<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-error">
  <div class="content">
    <div class="content-inside">
      <h1>ERROR 404</h1>
      <div class="info">
        <p>La página solicitada no se encuentra disponible en este momento.</p>
      </div>
    </div>
  </div>
</div>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>