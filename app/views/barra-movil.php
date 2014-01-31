<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-barra-movil">
  <div class="content">
    <div class="item item-1">
      <div class="item-head">
        <img src="<?= upload_url() ?>barra-movil/1.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Clásica</div>
      </div>
      <div class="item-content">     
        <div class="item-content-inside">     
          <ul>
            <li>Fernet 1882</li>
            <li>Gancia Americano</li>
            <li>Whiskey Old Smuggler</li>
            <li>Vodka Hiram Walker</li>
            <li>Ron Castillo</li>
            <li>Gin Burnet</li>
            <li class="marginb">Licores Bols</li>
            <li>Daiquiris frutales (Bacardi, fruta, limon y azucar)</li>
            <li>Fernet con cola</li>
            <li>Whiscola</li>
            <li>Gintonic</li>
            <li>Cuba Libre</li>
            <li>Destornillador</li>
            <li>Gancia batido</li>
            <li>Sex on the Beach</li>
            <li>Electric Melon</li>
            <li>President</li>
            <li>Piel de Iguana</li>
          </ul>
          <p class="little">La duración del servicio es de 5 horas.</p>
          <p class="little">Este servicio incluye barmans profesionales y vasos de vidrio.</p>
        </div>
      </div>
    </div>
    <div class="item item-2">
      <div class="item-head">     
        <img src="<?= upload_url() ?>barra-movil/2.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Importada</div>
      </div>
      <div class="item-content">     
        <div class="item-content-inside">     
          <ul>
            <li>Fernet Branca</li>
            <li>Gancia Americano</li>
            <li>Whiskey Johnnie Walker</li>
            <li>Vodka Skyy</li>
            <li>Ron Bacardi</li>
            <li>Gin Beefeaters</li>
            <li>Licores Bols</li>
            <li class="marginb">Tequila Jose Cuervo</li>
            <li>Daiquiris frutales (Bacardi, fruta, limon y azucar)</li>
            <li>Fernet con cola</li>
            <li>Whiscola</li>
            <li>Gintonic</li>
            <li>Cuba Libre</li>
            <li>Destornillador</li>
            <li>Gancia batido</li>
            <li>Sex on the Beach</li>
            <li>Electric Melon</li>
            <li>President</li>
            <li>Piel de Iguana</li>
            <li>Caipiroska</li>
            <li>Gancia Peach</li>
            <li>Margarita Frozzen</li>
            <li>Margarita Batida</li>
            <li>Mojito Cubano</li>
          </ul>
          <p class="little">La duración del servicio es de 5 horas.</p>
          <p class="little">Este servicio incluye barmans profesionales y vasos de vidrio.</p>
        </div>
      </div>
    </div>
    <div class="item item-3">
      <div class="item-head">     
        <img src="<?= upload_url() ?>barra-movil/3.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Premium</div>
      </div>
      <div class="item-content">     
        <div class="item-content-inside">     
          <ul>
            <li>Fernet Branca</li>
            <li>Gancia Americano</li>
            <li>Whiskey Chivas Regal</li>
            <li>Vodka Absolut</li>
            <li>Ron Havanna Club Añejo</li>
            <li>Gin Beefeaters</li>
            <li>Tequila Jose Cuervo</li>
            <li>Cachaca Velho Barreiro</li>
            <li>Aperitivo Campari</li>
            <li class="marginb">Licores Baileys/ Bols</li>
            <li>Daiquiris frutales (Bacardi, fruta, limon y azucar)</li>
            <li>Fernet con cola</li>
            <li>Whiscola</li>
            <li>Gintonic</li>
            <li>Cuba Libre</li>
            <li>Destornillador</li>
            <li>Gancia batido</li>
            <li>Sex on the Beach</li>
            <li>Electric Melon</li>
            <li>President</li>
            <li>Piel de Iguana</li>
            <li>Caipiroska</li>
            <li>Caipirinha</li>
            <li>Gancia Peach</li>
            <li>Margarita Frozzen</li>
            <li>Margarita Batida</li>
            <li>Mojito Cubano</li>
          </ul>
          <p class="little">La duración del servicio es de 5 horas.</p>
          <p class="little">Este servicio incluye barmans profesionales y vasos de vidrio.</p>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
$$('.app-section.app-section-barra-movil .content .item').each(function(item){
  item.getElement('.item-head').addEvent('click', function(){
    if(item.hasClass('active'))
    {
      $$('.app-section.app-section-barra-movil .content .item.active').removeClass('active');
      $$('.app-section.app-section-barra-movil .content .item.inactive').removeClass('inactive');
      return;
    }
    $$('.app-section.app-section-barra-movil .content .item.active').removeClass('active');
    $$('.app-section.app-section-barra-movil .content .item').addClass('inactive');
    item.removeClass('inactive').addClass('active');
  });
});
</script>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>