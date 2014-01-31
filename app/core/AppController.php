<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class AppController extends CI_Controller {

  var
    $data = array();

  function __construct()
  {
    parent::__construct();
    $this->load->config('app', TRUE);
  }

}