<div id="contact-form" class="form <?php echo isset($formOK) ? "form-ok" : "" ?>">
  <form method="post" action="<?php echo base_url() ?>contacto">
    <div class="form-fields">
      <div class="form-inputs">
        <div class="input dl"><label for="post-name-<?= $rnd ?>" class="GillSans-font">Nombre y Apellido</label><input id="post-name-<?= $rnd ?>" value="<?php echo $this->input->post("name") ?>" name="name" class="post" /></div>
        <div class="input"><label for="post-mail-<?= $rnd ?>" class="GillSans-font">E-mail</label><input id="post-mail-<?= $rnd ?>" value="<?php echo $this->input->post("mail") ?>" name="mail" class="post" /></div>
        <div class="input dl"><label for="post-event-<?= $rnd ?>" class="GillSans-font">Fecha del evento</label><input id="post-event-<?= $rnd ?>" value="<?php echo $this->input->post("event") ?>" name="event" class="post" /></div>
        <div class="input"><label for="post-tel-<?= $rnd ?>" class="GillSans-font">Teléfono</label><input id="post-tel-<?= $rnd ?>" value="<?php echo $this->input->post("tel") ?>" name="tel" class="post" /></div>
        <div class="input textarea"><label for="post-comments-<?= $rnd ?>" class="GillSans-font">Consulta</label><textarea id="post-comments-<?= $rnd ?>" name="comments" class="post"><?php echo $this->input->post("comments") ?></textarea></div>
      </div>
      <?php if(isset($error)):
      $errorArr['fields'] = 'Debes completar todos los campos';
      $errorArr['mail'] = 'El e-mail ingresado es inválido';
      ?>
      <div class="info-box">
        <p class="info-box-error"><?php echo $errorArr[$error] ?></p>
      </div>
      <?php endif ?>
      <?php if(isset($formOK)): ?>
      <div class="info-box">
        <p class="info-box-ok">Tu consulta fue enviada correctamente</p>
      </div>
      <?php else: ?>
      <div class="input submit"><input class="action-button GillSans-font" type="submit" value="Enviar" /></div>
      <?php endif ?>
    </div>
  </form>
</div>
<script>
window.addEvent('domready',function(){
  $$('.app-section.app-section-contacto form').addEvent('submit', function(e){
    var data = App.Helper.dataFromForm(this), where = $('app').getElement('.app-section.app-section-contacto .ajax-form');
    if( $defined(e)) e.stop();
    if( where.appfx == undefined )
      where.appfx = new Fx.Morph(where, {
          link: 'cancel',
          duration: 350
      });
    $$('.appBlockUI').addClass('garbage');
    App.Helper.blockUI(where);
    where.appfx.start({'opacity':.2});
    data.level = 2;
    new Request.HTML({
      evalScripts: false,
      url: this.get('action'),
      onSuccess : function(x1, x2, html, js){
        where.appfx.start({'opacity':0});
        var kf = function(){
          where.set('html', html);
          eval(js);
          App.Helper.unblockUI(where);
          App.Module.LinkElements();
          where.appfx.start({'opacity':1});
        }
        kf.delay(400);
      }
    }).post(data);
  });  
});
</script>