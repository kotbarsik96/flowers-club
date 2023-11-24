<?php

/**
 * RequestContactExport
 *
 * PHP version 5
 *
 * @category Class
 * @package  SendinBlue\Client
 * @author   Swagger Codegen team
 * @link     https://github.com/swagger-api/swagger-codegen
 */
/**
 * SendinBlue API
 *
 * SendinBlue provide a RESTFul API that can be used with any languages. With this API, you will be able to :   - Manage your campaigns and get the statistics   - Manage your contacts   - Send transactional Emails and SMS   - and much more...  You can download our wrappers at https://github.com/orgs/sendinblue  **Possible responses**   | Code | Message |   | :-------------: | ------------- |   | 200  | OK. Successful Request  |   | 201  | OK. Successful Creation |   | 202  | OK. Request accepted |   | 204  | OK. Successful Update/Deletion  |   | 400  | Error. Bad Request  |   | 401  | Error. Authentication Needed  |   | 402  | Error. Not enough credit, plan upgrade needed  |   | 403  | Error. Permission denied  |   | 404  | Error. Object does not exist |   | 405  | Error. Method not allowed  |   | 406  | Error. Not Acceptable  |
 *
 * OpenAPI spec version: 3.0.0
 * Contact: contact@sendinblue.com
 * Generated by: https://github.com/swagger-api/swagger-codegen.git
 * Swagger Codegen version: 2.4.12
 */
/**
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
namespace EasyWPSMTP\Vendor\SendinBlue\Client\Model;

use ArrayAccess;
use EasyWPSMTP\Vendor\SendinBlue\Client\ObjectSerializer;
/**
 * RequestContactExport Class Doc Comment
 *
 * @category Class
 * @package  SendinBlue\Client
 * @author   Swagger Codegen team
 * @link     https://github.com/swagger-api/swagger-codegen
 */
class RequestContactExport implements \EasyWPSMTP\Vendor\SendinBlue\Client\Model\ModelInterface, \ArrayAccess
{
    const DISCRIMINATOR = null;
    /**
     * The original name of the model.
     *
     * @var string
     */
    protected static $swaggerModelName = 'requestContactExport';
    /**
     * Array of property to type mappings. Used for (de)serialization
     *
     * @var string[]
     */
    protected static $swaggerTypes = ['exportAttributes' => 'string[]', 'contactFilter' => 'object', 'customContactFilter' => 'EasyWPSMTP\\Vendor\\SendinBlue\\Client\\Model\\RequestContactExportCustomContactFilter', 'notifyUrl' => 'string'];
    /**
     * Array of property to format mappings. Used for (de)serialization
     *
     * @var string[]
     */
    protected static $swaggerFormats = ['exportAttributes' => null, 'contactFilter' => null, 'customContactFilter' => null, 'notifyUrl' => 'url'];
    /**
     * Array of property to type mappings. Used for (de)serialization
     *
     * @return array
     */
    public static function swaggerTypes()
    {
        return self::$swaggerTypes;
    }
    /**
     * Array of property to format mappings. Used for (de)serialization
     *
     * @return array
     */
    public static function swaggerFormats()
    {
        return self::$swaggerFormats;
    }
    /**
     * Array of attributes where the key is the local name,
     * and the value is the original name
     *
     * @var string[]
     */
    protected static $attributeMap = ['exportAttributes' => 'exportAttributes', 'contactFilter' => 'contactFilter', 'customContactFilter' => 'customContactFilter', 'notifyUrl' => 'notifyUrl'];
    /**
     * Array of attributes to setter functions (for deserialization of responses)
     *
     * @var string[]
     */
    protected static $setters = ['exportAttributes' => 'setExportAttributes', 'contactFilter' => 'setContactFilter', 'customContactFilter' => 'setCustomContactFilter', 'notifyUrl' => 'setNotifyUrl'];
    /**
     * Array of attributes to getter functions (for serialization of requests)
     *
     * @var string[]
     */
    protected static $getters = ['exportAttributes' => 'getExportAttributes', 'contactFilter' => 'getContactFilter', 'customContactFilter' => 'getCustomContactFilter', 'notifyUrl' => 'getNotifyUrl'];
    /**
     * Array of attributes where the key is the local name,
     * and the value is the original name
     *
     * @return array
     */
    public static function attributeMap()
    {
        return self::$attributeMap;
    }
    /**
     * Array of attributes to setter functions (for deserialization of responses)
     *
     * @return array
     */
    public static function setters()
    {
        return self::$setters;
    }
    /**
     * Array of attributes to getter functions (for serialization of requests)
     *
     * @return array
     */
    public static function getters()
    {
        return self::$getters;
    }
    /**
     * The original name of the model.
     *
     * @return string
     */
    public function getModelName()
    {
        return self::$swaggerModelName;
    }
    /**
     * Associative array for storing property values
     *
     * @var mixed[]
     */
    protected $container = [];
    /**
     * Constructor
     *
     * @param mixed[] $data Associated array of property values
     *                      initializing the model
     */
    public function __construct(array $data = null)
    {
        $this->container['exportAttributes'] = isset($data['exportAttributes']) ? $data['exportAttributes'] : null;
        $this->container['contactFilter'] = isset($data['contactFilter']) ? $data['contactFilter'] : null;
        $this->container['customContactFilter'] = isset($data['customContactFilter']) ? $data['customContactFilter'] : null;
        $this->container['notifyUrl'] = isset($data['notifyUrl']) ? $data['notifyUrl'] : null;
    }
    /**
     * Show all the invalid properties with reasons.
     *
     * @return array invalid properties with reasons
     */
    public function listInvalidProperties()
    {
        $invalidProperties = [];
        return $invalidProperties;
    }
    /**
     * Validate all the properties in the model
     * return true if all passed
     *
     * @return bool True if all properties are valid
     */
    public function valid()
    {
        return \count($this->listInvalidProperties()) === 0;
    }
    /**
     * Gets exportAttributes
     *
     * @return string[]
     */
    public function getExportAttributes()
    {
        return $this->container['exportAttributes'];
    }
    /**
     * Sets exportAttributes
     *
     * @param string[] $exportAttributes List of all the attributes that you want to export. These attributes must be present in your contact database. For example, ['fname', 'lname', 'email'].
     *
     * @return $this
     */
    public function setExportAttributes($exportAttributes)
    {
        $this->container['exportAttributes'] = $exportAttributes;
        return $this;
    }
    /**
     * Gets contactFilter
     *
     * @return object
     */
    public function getContactFilter()
    {
        return $this->container['contactFilter'];
    }
    /**
     * Sets contactFilter
     *
     * @param object $contactFilter This attribute has been deprecated and will be removed by January 1st, 2021. Only one of the two filter options (contactFilter or customContactFilter) can be passed in the request. Set the filter for the contacts to be exported. For example, {\"blacklisted\":true} will export all the blacklisted contacts.
     *
     * @return $this
     */
    public function setContactFilter($contactFilter)
    {
        $this->container['contactFilter'] = $contactFilter;
        return $this;
    }
    /**
     * Gets customContactFilter
     *
     * @return \SendinBlue\Client\Model\RequestContactExportCustomContactFilter
     */
    public function getCustomContactFilter()
    {
        return $this->container['customContactFilter'];
    }
    /**
     * Sets customContactFilter
     *
     * @param \SendinBlue\Client\Model\RequestContactExportCustomContactFilter $customContactFilter customContactFilter
     *
     * @return $this
     */
    public function setCustomContactFilter($customContactFilter)
    {
        $this->container['customContactFilter'] = $customContactFilter;
        return $this;
    }
    /**
     * Gets notifyUrl
     *
     * @return string
     */
    public function getNotifyUrl()
    {
        return $this->container['notifyUrl'];
    }
    /**
     * Sets notifyUrl
     *
     * @param string $notifyUrl Webhook that will be called once the export process is finished. For reference, https://help.sendinblue.com/hc/en-us/articles/360007666479
     *
     * @return $this
     */
    public function setNotifyUrl($notifyUrl)
    {
        $this->container['notifyUrl'] = $notifyUrl;
        return $this;
    }
    /**
     * Returns true if offset exists. False otherwise.
     *
     * @param integer $offset Offset
     *
     * @return boolean
     */
    public function offsetExists($offset)
    {
        return isset($this->container[$offset]);
    }
    /**
     * Gets offset.
     *
     * @param integer $offset Offset
     *
     * @return mixed
     */
    public function offsetGet($offset)
    {
        return isset($this->container[$offset]) ? $this->container[$offset] : null;
    }
    /**
     * Sets value based on offset.
     *
     * @param integer $offset Offset
     * @param mixed   $value  Value to be set
     *
     * @return void
     */
    public function offsetSet($offset, $value)
    {
        if (\is_null($offset)) {
            $this->container[] = $value;
        } else {
            $this->container[$offset] = $value;
        }
    }
    /**
     * Unsets offset.
     *
     * @param integer $offset Offset
     *
     * @return void
     */
    public function offsetUnset($offset)
    {
        unset($this->container[$offset]);
    }
    /**
     * Gets the string presentation of the object
     *
     * @return string
     */
    public function __toString()
    {
        if (\defined('JSON_PRETTY_PRINT')) {
            // use JSON pretty print
            return \json_encode(\EasyWPSMTP\Vendor\SendinBlue\Client\ObjectSerializer::sanitizeForSerialization($this), \JSON_PRETTY_PRINT);
        }
        return \json_encode(\EasyWPSMTP\Vendor\SendinBlue\Client\ObjectSerializer::sanitizeForSerialization($this));
    }
}
