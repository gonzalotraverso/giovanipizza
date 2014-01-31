  </div> 
</div>
<div id="footer">   
  <div class="app-inside footer-inside">
    <div class="footer-inside-content">      
      <div class="footer-info"><span class="no-mobile-version"><?= $this->config->item('client', 'app') ?> © <?= date('Y') ?> ▪ </span>Teléfonos: 15 3593 9730 / 15 6515 3491</div>
      <div class="footer-copyright">
        <a href="http://globaldegree.com.ar/" class="tooltipElementDOM" title="Global Degree" target="_blank"><img src="<?= res_url() ?>ico/gd.png" /></a>
        <a href="http://efedesign.com.ar/" class="tooltipElementDOM" title="-F- Lanfranco" target="_blank"><img src="<?= res_url() ?>ico/efe.png" /></a>
      </div>
    </div>
  </div>
</div>
<div id="slide-background">
  <div class="app-bg-gradient"></div>
  <div class="bg-slider">
    <div class="bg-slider-container">
      <? 
      $arrSlider = range(1, 6);
      //shuffle($arrSlider);
      for($i = 0; $i < 6; $i++) : ?>
      <? if( !$i ): ?>
      <div style="background-image:url(<?= res_url() ?>bg-slider/0<?= $arrSlider[$i] ?>.jpg);" class="bg-slider-item"></div>
      <? else: ?>
      <div data-img-src="<?= res_url() ?>bg-slider/0<?= $arrSlider[$i] ?>.jpg" class="bg-slider-item not-loaded"></div>
      <? endif ?>
      <? endfor ?>
    </div>
  </div>  
</div>  
<script>
App.Module.LinkElements = function(){
  $$('.app-link-inside').removeEvents('click');
  $$('.app-link-inside').addEvent('click', function(event){
    if( this.get('data-index') != null )
    {
      $(this.get('data-index')).addClass('active');
    }
    else
    {
      if(this.getParent().hasClass('active'))
      {
        $('menu').addClass('open');
        return false;
      }
      $('menu').removeClass('open');
      $$('#menu li.active').removeClass('active');
      this.getParent().addClass('active');      
    }
    App.Module.LoadCustom(this.get('href'), 1, $('main') );
    return (event != undefined) ? event.stop() : false;
  });
  new Tips($$('.tooltipElementDOM'),  {
    onShow: function(tip, el){
      tip.setStyle('opacity',1);
    },
    onHide: function(tip, el){
      tip.setStyle('opacity',0);
    },
    'className': 'tooltipElement opacity'
  });
}
window.addEvent('resize', function(){
  $('app').setStyle('height', $$('body')[0].getSize().y);
  if( $('app').getSize().y > window.getSize().y )
    $('footer').addClass('not-fixed');
  else
    $('footer').removeClass('not-fixed');
});
window.addEvent('scroll', function(){
  window.fireEvent('resize');
});
window.addEvent('domready', function(){
  $$([".client-logo a", "#menu a"]).each(function(item){
    item.erase("title");
  });
  $('menu').addEvent('mouseleave', function(){
    $('menu').removeClass('open');
  });
  var loadSliderImg = function(){
    if( !$$('#slide-background .bg-slider .bg-slider-item.not-loaded').length ) return clearInterval(loadSliderImg);
    var item = $$('#slide-background .bg-slider .bg-slider-item.not-loaded')[0];
    item.removeClass('not-loaded');
    item.setStyle('background-image', 'url(' + item.get('data-img-src') + ')' );
  };
  loadSliderImg.periodical(1500);
  var widget = $('slide-background').getElement('.bg-slider'), backgroundSlider = new App.Helper.Slider({
    slideTimer: 12000,
    transitionTime: 1600,
    transitionType: 'quart:out',     
    orientation: 'horizontal',     
    fade: false,
    isPaused: false,        
    numNavActive: false,
    container: widget.getElement('.bg-slider-container'),
    items: widget.getElements('.bg-slider-item')
  });
  backgroundSlider.start();
  App.Module.LinkElements();
  window.fireEvent('resize');  
});
</script>
<?php $this->load->view("main/analytics") ?>
</body>
</html>