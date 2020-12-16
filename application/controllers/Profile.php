<?php

class Profile extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->helper(array('url', 'html'));
        $this->load->database();
        $this->load->model('user_model');
        $this->load->model('project_model');

    }

    function index()
    {
        if (!$this->ion_auth->logged_in()) {
            redirect('/auth/login?ru=/' . uri_string());
        }

        $id = $this->session->userdata('user_id');
        $details = $this->user_model->get_user_by_id($id);
        $user_role = $this->ion_auth->admin_scope();
        $scope = $user_role->scope;
        $is_admin = $user_role->admin;
        if($is_admin) {
            $scope = empty($scope) ? $this->lang->line('gp_admin_full_name') : $scope;
        }

        $data['title'] = $this->lang->line('gp_profile_title');
        $data['projects_public'] = $this->project_model->get_public_projects();
        $data['available_languages'] = get_languages();
        $data['lang'] = $this->session->userdata('lang') == null ? get_code($this->config->item('language')) : $this->session->userdata('lang');
        $data['logged_in'] = true;
		$data['is_admin'] = $is_admin;
		$data['role'] = $user_role->role_name;
		$data['role_scope'] = $scope;
		if (!empty($user_role->role_name)) {
			$data['role_name'] = $this->user_model->get_role($user_role->role_name)->name;
		} else {
			$data['role_name'] = null;
		}

		$this->load->view('templates/header', $data);
		$this->load->view('templates/header_navigation', $data);

		if ($this->session->userdata('user_id') !== null) {
			$data['user'] = $details;
			//$data['projects'] = $this->project_model->get_projects(false, $details->project_ids, $details->admin);

			$this->load->view('profile_view', $data);
		} else {
			$data['user'] = null;
			$data['projects'] = null;
		}

//        if (($data['projects'] === null) or (empty($data['projects']))) {
//            if ($this->session->userdata('user_name') !== 'guest') {
//                $this->load->view('message_view', array('message' => $this->lang->line('gp_no_projects'), 'type' => 'warning'));
//            }
//        } else {
//            $this->load->view('user_projects_view', $data);
//        }

        if (($data['projects_public'] === null) or (empty($data['projects_public']))) {
            $this->load->view('message_view', array('message' => $this->lang->line('gp_no_public_projects'), 'type' => 'info'));
        } else {
            $this->load->view('public_projects_view', $data);
        }

		$this->load->view('templates/footer');

    }
}
