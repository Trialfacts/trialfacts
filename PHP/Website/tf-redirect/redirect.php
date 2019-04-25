<?php
/*
 * Plugin Name: Trialfacts Redirect
 * Plugin URI: https://www.trialfacts.com/
 * Description: Trialfacts redirect shortcodes.
 * Version: 1.0
 * Author: Andro Marces
 * Author URI: https://www.trialfacts.com/
 */

// VARIABLES
/* server variables */
$ipaddress = $_SERVER["REMOTE_ADDR"];
$referrer = $_SERVER["HTTP_REFERER"];
if (!$referrer) {
    $referrer = "None";
}
$useragent = $_SERVER["HTTP_USER_AGENT"];
$qs = $_SERVER["QUERY_STRING"]; /* query string variable */
$redirected = false;
/* message object */
$message = json_decode('{
    "text": "*PAGE REDIRECT*>\n\n>*VISITOR INFO:*\n",
    "attachments": [
        {
            "fallback": "QUERY STRING",
            "color": "#75be09",
            "title": "QUERY STRING",
            "text": ""
        }
    ]
}');
$message->text .= ">IP: " . $ipaddress . "\n>Referrer: " . $referrer . "\n>User Agent: " . $useragent;
/* slack webhooks */
require "slack.php";

// SHORTCODE
function tfredirect($atts)
{
    global $redirected;
    if ($redirected) {
        exit;
    }
    global $qs;
    global $message;
    global $referrer;
    // normalize attribute keys, lowercase
    $atts = array_change_key_case((array) $atts, CASE_LOWER);

    // override default attributes with user attributes
    $redirect = shortcode_atts([
        "targetqs" => "",
        "referrer" => "",
        "newqs" => "",
        "newurl" => "",
        "channel" => "logs",
    ], $atts);

    if ($redirect["targetqs"] && $redirect["newqs"] && $redirect["newurl"]) {
        if ($redirect["referrer"] && strpos($referrer, $redirect["referrer"]) !== false) {
            $QSarray = processQS($qs, $redirect["targetqs"], $redirect["newqs"]);
            if ($QSarray["found"]) {
                header("Location:" . $redirect["newurl"] . "?" . $QSarray["newQS"]);
                $message->attachments[0]->text = $QSarray["QS"];
                $message->text = "<https://trialfacts.com/wp/wp-admin/post.php?post=" . get_the_ID() . "&action=edit&classic-editor|" . $message->text;
                $message->text .= "\n\n>*REDIRECTED TO:* " . $redirect["newurl"] . "?" . $QSarray["newQS"] . "\n\n";
                slackMessage($message, $redirect["channel"]);
                $redirected = true;
            }
        } elseif (!$redirect["referrer"]) {
            $QSarray = processQS($qs, $redirect["targetqs"], $redirect["newqs"]);
            if ($QSarray["found"]) {
                header("Location:" . $redirect["newurl"] . "?" . $QSarray["newQS"]);
                $message->text = "<https://trialfacts.com/wp/wp-admin/post.php?post=" . get_the_ID() . "&action=edit&classic-editor|" . $message->text;
                $message->text .= "\n\n>*REDIRECTED TO:* " . $redirect["newurl"] . "?" . $QSarray["newQS"] . "\n\n";
                $message->attachments[0]->text = $QSarray["QS"];
                slackMessage($message, $redirect["channel"]);
                $redirected = true;
            }
        }
    } elseif (!$redirect["targetqs"] && !$redirect["newqs"] && $redirect["newurl"]) {
        $QSarray = processQS($qs);
        header("Location:" . $redirect["newurl"]);
        $message->text = "<https://trialfacts.com/wp/wp-admin/post.php?post=" . get_the_ID() . "&action=edit&classic-editor|" . $message->text;
        $message->text .= "\n\n>*REDIRECTED TO:* " . $redirect["newurl"] . "\n\n";
        $message->attachments[0]->text = $QSarray["QS"];
        slackMessage($message, $redirect["channel"]);
        $redirected = true;
    }
}
add_shortcode("tfredirect", "tfredirect");

// FUNCTIONS

/*
 * process the query string, look for the target
 * query string and return processed query string to
 * be used on notification
 * returns result array
 */
function processQS($querystring, $targetQS = null, $newQS = null)
{
    /*
     * result array
     */
    $result = array();
    $result["QS"] = "";
    $result["found"] = false;
    $result["newQS"] = "";

    if ($querystring && $targetQS && $newQS) {
        $array = explode("&", $querystring);
        foreach ($array as $key => $value) {
            if (strpos($value, $targetQS) !== false) {
                $result["found"] = true;
                $extracted = preg_match('/=(.+)/', $value, $match);
                if (!$extracted) {
                    $result["newQS"] = $newQS;
                } else {
                    $result["newQS"] = $newQS . "=" . $match[1];
                }
            }
            end($array);
            if ($key === key($array)) {
                $result["QS"] .= str_replace("=", ": ", $value);
            } else {
                $result["QS"] .= str_replace("=", ": ", $value) . "\n";
            }
        }
    } else if ($querystring) {
        $array = explode("&", $querystring);
        foreach ($array as $key => $value) {
            end($array);
            if ($key === key($array)) {
                $result["QS"] .= str_replace("=", ": ", $value);
            } else {
                $result["QS"] .= str_replace("=", ": ", $value) . "\n";
            }
        }
    } else {
        $result["QS"] = "None";
    }
    return $result;
}

/* send a slack message to a channel */
/* parameters:
 * $message -> message object with text or attachments as keys
 * $channel -> channel name string */
function slackMessage($message, $channel)
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

// PAGE TEMPLATER
/* taken from https://www.wpexplorer.com/wordpress-page-templates-plugin */
class PageTemplater
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
            self::$instance = new PageTemplater();
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
            'empty.php' => 'Empty Page',
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
add_action('plugins_loaded', array('PageTemplater', 'get_instance'));
