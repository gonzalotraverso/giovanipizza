<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-servicios">
  <div class="content">
    <div class="item item-1">
      <div class="item-head">
        <img src="<?= upload_url() ?>servicios/1.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Bebidas</div>
      </div>
      <div class="item-content">     
        <div class="item-content-inside">
          <h2>En su modalidad libre</h2>
          <ul>
            <li>Agua y gaseosas (línea Coca Cola)</li>
            <li>Cerveza, agua y gaseosas (línea Coca Cola y cerveza Quilmes)</li>
          </ul>
          <p class="little">* Este servicio incluye sistema de enfriamiento, vasos de vidrio y hielos.</p>
        </div>
      </div>
    </div>
    <div class="item item-2">
      <div class="item-head">     
        <img src="<?= upload_url() ?>servicios/2.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Mesa dulce</div>
      </div>
      <div class="item-content">
        <div class="item-content-inside">
          <ul>
            <li>Cheese cake</li>
            <li>Habannet</li>
            <li>Mousse (Menta, maracuyá, chocolate blanco o negro)</li>
            <li>Tarta de Frutillas</li>
            <li>Marquisse</li>
            <li>Pasta flora</li>
            <li>Torta de ricota</li>
            <li>Frutos del bosque</li>
            <li>Nuez y chocolate blanco</li>
            <li>Lemon pie</li>
            <li>Coco y dulce de leche</li>
          </ul>
          <p class="little">* Todos los postres incluyen vajillas y cubiertos.</p>
        </div>
      </div>
    </div>
    <div class="item item-3">
      <div class="item-head">     
        <img src="<?= upload_url() ?>servicios/3.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Postres</div>
      </div>
      <div class="item-content">    
        <div class="item-content-inside">

          <ul>
            <li>Palito bombón helado</li>
            <li>Almendrado con salsa de chocolate</li>
            <li>Arrollado de dulce de leche con salsa de chocolate</li>
            <li>Helado Freddo</li>
            <li>Bombón Escocés con salsa de chocolate, oblea y frutillas</li>
            <li>Brownie con helado de vainilla, rociado con lluvia de chocolate</li>
          </ul>
          <p class="little">* Todos los postres incluyen vajillas y cubiertos.</p>
        </div>
      </div>
    </div>
    <div class="item item-4">
      <div class="item-head">     
        <img src="<?= upload_url() ?>servicios/4.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Entradas</div>
      </div>
      <div class="item-content">
        <div class="item-content-inside">
          <ul>
            <li>Empanaditas de carne</li>
            <li>Nachos con salsas de guacamole, pico de gallo y ciboulette</li>
            <li>Brochettes de Carne, Pollo y Vegetales</li>
            <li>Canapés y pinchos:<br/>
            <p class="ml">Roquefort y nuez</p>
            <p class="ml">Salmón ahumado y queso crema</p>
            <p class="ml">Jamón crudo, tomate seco y rúcula</p>
            <p class="ml">Tomate cherry, muzzarella y albahaca</p></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="item item-5">
      <div class="item-head">     
        <img src="<?= upload_url() ?>servicios/5.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Brindis</div>
      </div>
      <div class="item-content">
        <div class="item-content-inside">
          <ul>
            <li>Chandon</li>
            <li>Federico de Alvear</li>
            <li>Mumm</li>
            <li>Baron B</li>
            <li>Santa Julia</li>
          </ul>
          <p class="little">* Este servicio incluye sistema de enfriamiento, copas de vidrio y hielos.</p>
        </div>
      </div>
    </div>
    <div class="item item-6">
      <div class="item-head">     
        <img src="<?= upload_url() ?>servicios/6.jpg" class="item-img" />
        <div class="item-head-content GillSans-font">Vinos</div>
      </div>
      <div class="item-content">
        <div class="item-content-inside">
          <ul>
            <li>Santa Julia</li>
            <li>Valmont</li>
            <li>Latitud 33</li>
            <li>Estiba 1</li>
            <li>Graffigna</li>
            <li>Trumpeter</li>
            <li>Terrazas</li>
            <li>Trapiche</li>
          </ul>
          <p class="little">* Este servicio incluye copas de vidrio.</p>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
$$('.app-section.app-section-servicios .content .item').each(function(item, index){
  item.getElement('.item-head').addEvent('click', function(){
    App.Helper.changeAppClass('servicios servicios-' + (index+1) );
    if(item.hasClass('active'))
    {
      $$('.app-section.app-section-servicios .content .item.active').removeClass('active');
      $$('.app-section.app-section-servicios .content .item.inactive').removeClass('inactive');
      return;
    }
    $$('.app-section.app-section-servicios .content .item.active').removeClass('active');
    $$('.app-section.app-section-servicios .content .item').addClass('inactive');
    item.removeClass('inactive').addClass('active');
  });
});
</script>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>