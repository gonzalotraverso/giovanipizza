<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-contacto">
  <div class="content">
    <div class="content-inside">
      <div class="ajax-form">
        <?php $this->load->view('widget/contacto-form') ?>
      </div>
    </div>
  </div>
</div>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>