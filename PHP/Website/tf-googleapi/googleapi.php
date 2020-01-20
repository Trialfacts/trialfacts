<?php
/*
 * Plugin Name: Trialfacts Google API
 * Plugin URI: https://www.trialfacts.com/
 * Description: Trialfacts Google API endpoint.
 * Version: 1.0
 * Author: Andro Marces
 * Author URI: https://www.trialfacts.com/
 */

// SHORTCODE
function tfgoogle($atts)
{
    // CHECK IF LOGGED IN
    $auth = false;
    foreach ($_COOKIE as $key => $value) {
        if (strpos($key, 'wordpress_logged_in') > -1) {
            $auth = true;
            break;
        }
    }
    if ($auth == false) {
            header("Location:https://trialfacts.com");
        return;
    }

    // VARS
    $services = [
        "cal" => [
            "add" => [
                "reqs" => [
                    "calID",
                    "event",
                ],
                "function" => function ($params) {
                    $service = initService();
                    $service->events->insert($calID, $event);
                },
            ],
            "edit" => [
                "reqs" => [
                    "calID",
                    "event",
                    "optParams",
                ],
                "function" => function ($params) {
                    $calID = $params["calID"];
                    if ($params["optParams"]) {
                        $optParams = json_decode(stripslashes($params["optParams"]), true);
                    } else {
                        $optParams = [];
                    }
                    $optParams["singleEvents"] = true;
                    $optParams["maxResults"] = 1;
                    $service = initService();
                    // $optParams["timeMin"] = date("c", time());
                    $events = $service->events->listEvents($calID, $optParams);
                    $event = $events->getItems();
                    echo $event->getSummary() . "\n";
                    echo $event->getId() . "\n";
                    echo $event->getRecurringEventId();
                    // $service->events->insert($calID, $event);
                },
            ],
            "delete" => [
                "reqs" => [
                    "calID",
                    "event",
                    "optParams",
                ],
                "function" => function ($params) {
                    $service = initService();
                    $service->events->delete('primary', 'eventId');
                },
            ],
            "timezone" => [
                "reqs" => [
                    "calID",
                ],
                "function" => function ($params) {
                    $calID = $params["calID"];
                    $service = initService();
                    $calendar = $service->calendars->get($calID);
                    echo $calendar->getTimeZone();
                },
            ],
            "get" => [
                "reqs" => [
                    "calID",
                    "optParams",
                ],
                "function" => function ($params) {
                    $calID = $params["calID"];
                    if ($params["optParams"]) {
                        $optParams = json_decode(stripslashes($params["optParams"]), true);
                    } else {
                        $optParams = [];
                    }
                    $optParams["singleEvents"] = true;
                    $optParams["maxResults"] = 1;
                    $service = initService();
                    $events = $service->events->listEvents($calID, $optParams);
                    foreach ($events->getItems() as $event) {
                        $data = [];
                        $data["title"] = $event->getSummary();
                        $data["eventID"] = $event->getId();
                        $data["description"] = $event->getDescription();
                        $data["start"] = $event->getStart();
                        $data["end"] = $event->getEnd();
                        echo json_encode($data);
                    }
                },
            ],
        ],
    ];

    // SLACK
    // /* message object */
    // $message = json_decode('{
    //     "text": "*PAGE REDIRECT*>\n\n>*VISITOR INFO:*\n",
    //     "attachments": [
    //         {
    //             "fallback": "QUERY STRING",
    //             "color": "#75be09",
    //             "title": "QUERY STRING",
    //             "text": ""
    //         }
    //     ]
    // }');
    // $message->text .= ">IP: " . $ipaddress . "\n>Referrer: " . $referrer . "\n>User Agent: " . $useragent;
    // /* slack webhooks */
    // require "slack.php";

    // normalize attribute keys, lowercase
    $atts = array_change_key_case((array) $atts, CASE_LOWER);

    // override default attributes with user attributes
    $google = shortcode_atts([
        "slack" => false,
    ], $atts);

    // CHECK IF calID and service is sent via POST
    if (isset($_POST["service"]) && isset($_POST["method"])) {
        $reqs = $services[$_POST["service"]][$_POST["method"]]["reqs"];
        $params = [];
        foreach ($reqs as $value) {
            if (!isset($_POST[$value])) {
                header("Location:https://trialfacts.com");
                return;
            } else {
                $params[$value] = $_POST[$value];
            }
        }
        $services[$_POST["service"]][$_POST["method"]]["function"]($params);
    } else {
        header("Location:https://trialfacts.com");
        return;
    }

    // // Print the next 10 events on the user's calendar.
    // $calendarId = $_POST["calID"];
    // $optParams = array(
    //     'maxResults' => 10,
    //     'orderBy' => 'startTime',
    //     'singleEvents' => true,
    //     'timeMin' => date('c'),
    // );
    // $results = $service->events->listEvents($calendarId, $optParams);
    // $events = $results->getItems();

    // if (empty($events)) {
    //     print "No upcoming events found.\n";
    // } else {
    //     print "Upcoming events:\n";
    //     foreach ($events as $event) {
    //         $start = $event->start->dateTime;
    //         if (empty($start)) {
    //             $start = $event->start->date;
    //         }
    //         printf("%s (%s)\n", $event->getSummary(), $start);
    //     }
    // }
}
add_shortcode("tfgoogle", "tfgoogle");

// FUNCTIONS
/* send a slack message to a channel */
/* requires slack.php */
/* parameters:
 * $message -> message object with text or attachments as keys
 * $channel -> channel name string */
function tfGoogleSlackMessage($message, $channel)
{
    global $webhooks;
    $channel = strtolower(trim($channel));
    $channel = $webhooks->$channel;

    // use key "http" even if you send the request to https://...
    $options = array(
        "http" => array(
            "method" => "POST",
            "header" => "Content-type: application/json\r\n",
            "content" => json_encode($message),
        ),
    );
    $context = stream_context_create($options);
    $result = file_get_contents($channel, false, $context);
// if ($result === false) { /* Handle error */}
    // echo "<pre>" . var_export($result) . "</pre>";
}

function initService()
{
    // LOAD GOOGLE API PHP CLIENT
    require_once "google-api-php-client/vendor/autoload.php";

    putenv('GOOGLE_APPLICATION_CREDENTIALS=' . __DIR__ . '/gapi.json');
    $client = new Google_Client();
    $client->useApplicationDefaultCredentials();
    $client->setApplicationName('Trialfacts Google API');
    $client->setScopes(['https://www.googleapis.com/auth/calendar']);
    $service = new Google_Service_Calendar($client);
    return $service;
}

// PAGE TEMPLATER
/* adds page template to list of page templates in editor */
/* taken from https://www.wpexplorer.com/wordpress-page-templates-plugin */
class TFGooglePageTemplater
{
    /**
     * A reference to an instance of this class.
     */
    private static $instance;
    /**
     * The array of templates that this plugin tracks.
     */
    protected $templates;
    /**
     * Returns an instance of this class.
     */
    public static function get_instance()
    {
        if (null == self::$instance) {
            self::$instance = new TFGooglePageTemplater();
        }
        return self::$instance;
    }
    /**
     * Initializes the plugin by setting filters and administration functions.
     */
    private function __construct()
    {
        $this->templates = array();
        // Add a filter to the attributes metabox to inject template into the cache.
        if (version_compare(floatval(get_bloginfo('version')), '4.7', '<')) {
            // 4.6 and older
            add_filter(
                'page_attributes_dropdown_pages_args',
                array($this, 'register_project_templates')
            );
        } else {
            // Add a filter to the wp 4.7 version attributes metabox
            add_filter(
                'theme_page_templates', array($this, 'add_new_template')
            );
        }
        // Add a filter to the save post to inject out template into the page cache
        add_filter(
            'wp_insert_post_data',
            array($this, 'register_project_templates')
        );
        // Add a filter to the template include to determine if the page has our
        // template assigned and return it's path
        add_filter(
            'template_include',
            array($this, 'view_project_template')
        );
        // Add your templates to this array.
        $this->templates = array(
            'googleapi_page.php' => 'Google API Page',
        );
    }
    /**
     * Adds our template to the page dropdown for v4.7+
     *
     */
    public function add_new_template($posts_templates)
    {
        $posts_templates = array_merge($posts_templates, $this->templates);
        return $posts_templates;
    }
    /**
     * Adds our template to the pages cache in order to trick WordPress
     * into thinking the template file exists where it doens't really exist.
     */
    public function register_project_templates($atts)
    {
        // Create the key used for the themes cache
        $cache_key = 'page_templates-' . md5(get_theme_root() . '/' . get_stylesheet());
        // Retrieve the cache list.
        // If it doesn't exist, or it's empty prepare an array
        $templates = wp_get_theme()->get_page_templates();
        if (empty($templates)) {
            $templates = array();
        }
        // New cache, therefore remove the old one
        wp_cache_delete($cache_key, 'themes');
        // Now add our template to the list of templates by merging our templates
        // with the existing templates array from the cache.
        $templates = array_merge($templates, $this->templates);
        // Add the modified cache to allow WordPress to pick it up for listing
        // available templates
        wp_cache_add($cache_key, $templates, 'themes', 1800);
        return $atts;
    }
    /**
     * Checks if the template is assigned to the page
     */
    public function view_project_template($template)
    {
        // Return the search template if we're searching (instead of the template for the first result)
        if (is_search()) {
            return $template;
        }
        // Get global post
        global $post;
        // Return template if post is empty
        if (!$post) {
            return $template;
        }
        // Return default template if we don't have a custom one defined
        if (!isset($this->templates[get_post_meta(
            $post->ID, '_wp_page_template', true
        )])) {
            return $template;
        }
        // Allows filtering of file path
        $filepath = apply_filters('page_templater_plugin_dir_path', plugin_dir_path(__FILE__));
        $file = $filepath . get_post_meta(
            $post->ID, '_wp_page_template', true
        );
        // Just to be safe, we check if the file exist first
        if (file_exists($file)) {
            return $file;
        } else {
            echo $file;
        }
        // Return template
        return $template;
    }
}
add_action('plugins_loaded', array('TFGooglePageTemplater', 'get_instance'));
