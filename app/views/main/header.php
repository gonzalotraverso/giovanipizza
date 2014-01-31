<?php $this->load->view('main/html') ?>
<div data-class="<?= $section ?>" class="<?= $section ?>" id="app">
  <div class="client-logo">
    <a class="app-link-inside" data-index="li-index-inicio" href="<?= base_url() ?>" title="<?= $this->config->item('client','app') ?>"><img alt="<?= $this->config->item('client','app') ?>" src="<?= res_url() ?>logo.png" /></a>
  </div>
  <div id="side">
    <div class="app-side-gradient"></div>
    <ul class="GillSans-font transition-all-5s" id="menu">
      <li id="li-index-inicio" class="<?= ($this->uri->segment(1,'home') == 'home') ? 'active' : '' ?>"><a class="app-link-inside" title="Inicio" href="<?= base_url() ?>"><span class="label">Inicio</span><span class="mobile-ico"><span class="mobile-ico-line mobile-ico-line-1"></span><span class="mobile-ico-line mobile-ico-line-2"></span><span class="mobile-ico-line mobile-ico-line-3"></span></span><span class="ico"></span></a></li>
      <li class="<?= ($this->uri->segment(1,'home') == 'menu') ? 'active' : '' ?>"><a class="app-link-inside" title="Menú" href="<?= base_url() ?>menu"><span class="label">Menú</span><span class="ico"></span></a></li>
      <li class="<?= ($this->uri->segment(1,'home') == 'servicios') ? 'active' : '' ?>"><a class="app-link-inside" title="Servicios" href="<?= base_url() ?>servicios"><span class="label">Servicios</span><span class="ico"></span></a></li>
      <li class="<?= ($this->uri->segment(1,'home') == 'barra-movil') ? 'active' : '' ?>"><a class="app-link-inside" title="Barra móvil" href="<?= base_url() ?>barra-movil"><span class="label">Barra móvil</span><span class="ico ico-barra-movil"></span></a></li>
      <li class="<?= ($this->uri->segment(1,'home') == 'clientes') ? 'active' : '' ?>"><a class="app-link-inside" title="Clientes" href="<?= base_url() ?>clientes"><span class="label">Clientes</span><span class="ico"></span></a></li>
      <li class="<?= ($this->uri->segment(1,'home') == 'contacto') ? 'active' : '' ?>"><a class="app-link-inside" title="Contacto" href="<?= base_url() ?>contacto"><span class="label">Contacto</span><span class="ico"></span></a></li>
<div class="tels" style="
    margin-left: 10px;
    line-height: 19px;
">15 3593 9730<br>15 6515 3491</div>
      <li class="facebook transition-all-3s"><a target="_blank" href="http://www.facebook.com/giovanipizza"><img alt="Facebook" src="<?= res_url() ?>ico/facebook.jpg" /></a></li>
    </ul>
    <div class="transition-all-5s side-bg"></div>
    <div class="pointer transition-all-5s"><div class="pointer-ico transition-all-5s"></div></div>
  </div>
  <div id="main">