<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

class Home extends AppController
{

  public function index( $section = '' )
  {
    if( !$section )
      $section = 'home';
    $sections = array('home', 'menu', 'servicios', 'barra-movil', 'clientes');
    if( !in_array($section, $sections) ) return $this->error();
    $this->data['section'] = $section;
    $this->load->view($section, $this->data);
  }

  public function contacto()
  {
    $this->data['section'] = 'contacto';
    $this->load->helper('string');
    $this->data['rnd'] = random_string();
    if( $this->input->post('level') == 2 )
    {
      $this->_contactProcess();
      return $this->load->view('widget/contacto-form', $this->data);
    }
    $this->load->view('contacto', $this->data);
  }

  private function _contactProcess()
  {
    if( !count($_POST)) return;
    if( !$this->input->post('name') || !$this->input->post('mail') || !$this->input->post('comments') )
      return $this->data['error'] = 'fields';
    $this->load->helper('email');
    if( !valid_email($this->input->post('mail')) )
      return $this->data['error'] = 'mail';
    $this->load->library('PHPMailer');
    $mail = new PHPMailer();
    $mail->From = $this->config->item('client-mail', 'app');
    $mail->FromName = $this->config->item('client', 'app');
    
    $mail->AddAddress("info@giovanipizza.com.ar");
    $mail->AddBCC("giovanicatering@hotmail.com");
    $mail->AddBCC("juanazareno@gmail.com");
    
    $mail->IsHTML(true);
    $mensaje = $this->load->view('widget/template-mail', $this->data, true);
    $mail->Subject  = 'Formulario de contacto';
    $mail->Body  =  $mensaje;
    @$mail->Send();
    $this->data['formOK'] = 1;

  }

  public function error()
  {
    $this->data['section'] = 'home';
    $this->load->view('error', $this->data);
  }

}