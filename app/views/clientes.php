<?php if(!AJAX) $this->load->view("main/header") ?>
<div class="app-section app-section-clientes">
  <div class="content">
    <div class="content-inside">
       <div class="widget-slider non-selectable">
        <div class="widget-slider-navigation">
          <div class="widget-slider-navigation-bg">
            <div class="widget-slider-arrow widget-slider-arrow-left"></div>
            <ul class="widget-slider-count"></ul>
            <div class="widget-slider-arrow widget-slider-arrow-right"></div>
          </div>
        </div>
        <div class="widget-slider-container">
        <? $j = 0; for($i = 0; $i < 15; $i++) : ?>
          <? if( !$j ): ?>
          <div class="widget-slider-item">
          <? endif ?>
            <div class="widget-slider-img">
              <img src="<?= upload_url() . 'clientes/' . str_pad($i, 2, "0", STR_PAD_LEFT) . '.png' ?>" />
            </div>
          <? $j++ ?>
          <? if( $j > 3 ): ?>
          </div>
          <? $j = 0; endif ?>
          <? endfor ?>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
$$('.widget-slider').each(function(widget){
  if(widget.hasClass('widget-rendered')) return;
  widget.addClass('widget-rendered');
  var items = widget.getElements('.widget-slider-item');
  if(!items.length > 0) return widget.setStyle('display','none');
  var widgetSlider = new App.Helper.Slider({
    slideTimer: 3500,
    transitionType: 'quint:out',     
    orientation: 'horizontal',     
    fade: false,      
    numNavHolder: widget.getElement('.widget-slider-count'),            
    isPaused: !widget.hasClass('auto-start'),        
    numNavActive: true,
    prevBtn: widget.getElement('.widget-slider-arrow-left'),
    nextBtn: widget.getElement('.widget-slider-arrow-right'),
    container: widget.getElement('.widget-slider-container'),
    items: items
  });
  widgetSlider.start();
}); 
</script>
<?php if(AJAX) $this->load->view("widget/active-section", array('asection' => $section)) ?>
<?php if(!AJAX) $this->load->view("main/footer") ?>