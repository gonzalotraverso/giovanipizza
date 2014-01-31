<?php
$lang = $this->config->item('lang', 'app');
$layoutversion = $this->config->item('layout-version', 'app');
?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $lang ?>" lang="<?php echo $lang ?>">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-language" content="<?php echo $lang ?>" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<?php $this->load->view('main/metatags') ?>
<link rel="icon" href="<?php echo res_url() ?>favicon.png" type="image/x-icon" />
<link rel="shortcut icon" href="<?php echo res_url() ?>favicon.png" type="image/x-icon" />
<?php $this->load->view('main/css', array('layoutversion' => $layoutversion) ) ?>
<script type="text/javascript">var AppURL = '<?php echo base_url() ?>', AppRes = '<?php echo res_url() ?>';</script>
<script type="text/javascript" src="<?php echo res_url() ?>js/mt-core.js<?php echo $layoutversion ?>"></script>
<script type="text/javascript" src="<?php echo res_url() ?>js/mt-more.js<?php echo $layoutversion ?>"></script>
<script type="text/javascript" src="<?php echo res_url() ?>js/app.js<?php echo $layoutversion ?>"></script>
<script>
App.Helper.checkURI();
$('head-title').set('html', '<?php echo $this->config->item('client', 'app') ?>');
$('head-description').set('value', '');
$('head-keywords').set('value', '');
</script>
</head>
<body id="app-body" class="app-body lang-<?php echo $lang ?>">