<?php

/**
 * RequestContactExportCustomContactFilter
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
 * RequestContactExportCustomContactFilter Class Doc Comment
 *
 * @category Class
 * @description Only one of the two filter options (contactFilter or customContactFilter) can be passed in the request. Set the filter for the contacts to be exported.
 * @package  SendinBlue\Client
 * @author   Swagger Codegen team
 * @link     https://github.com/swagger-api/swagger-codegen
 */
class RequestContactExportCustomContactFilter implements \EasyWPSMTP\Vendor\SendinBlue\Client\Model\ModelInterface, \ArrayAccess
{
    const DISCRIMINATOR = null;
    /**
     * The original name of the model.
     *
     * @var string
     */
    protected static $swaggerModelName = 'requestContactExport_customContactFilter';
    /**
     * Array of property to type mappings. Used for (de)serialization
     *
     * @var string[]
     */
    protected static $swaggerTypes = ['actionForContacts' => 'string', 'actionForEmailCampaigns' => 'string', 'actionForSmsCampaigns' => 'string', 'listId' => 'int', 'emailCampaignId' => 'int', 'smsCampaignId' => 'int'];
    /**
     * Array of property to format mappings. Used for (de)serialization
     *
     * @var string[]
     */
    protected static $swaggerFormats = ['actionForContacts' => null, 'actionForEmailCampaigns' => null, 'actionForSmsCampaigns' => null, 'listId' => 'int64', 'emailCampaignId' => 'int64', 'smsCampaignId' => 'int64'];
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
    protected static $attributeMap = ['actionForContacts' => 'actionForContacts', 'actionForEmailCampaigns' => 'actionForEmailCampaigns', 'actionForSmsCampaigns' => 'actionForSmsCampaigns', 'listId' => 'listId', 'emailCampaignId' => 'emailCampaignId', 'smsCampaignId' => 'smsCampaignId'];
    /**
     * Array of attributes to setter functions (for deserialization of responses)
     *
     * @var string[]
     */
    protected static $setters = ['actionForContacts' => 'setActionForContacts', 'actionForEmailCampaigns' => 'setActionForEmailCampaigns', 'actionForSmsCampaigns' => 'setActionForSmsCampaigns', 'listId' => 'setListId', 'emailCampaignId' => 'setEmailCampaignId', 'smsCampaignId' => 'setSmsCampaignId'];
    /**
     * Array of attributes to getter functions (for serialization of requests)
     *
     * @var string[]
     */
    protected static $getters = ['actionForContacts' => 'getActionForContacts', 'actionForEmailCampaigns' => 'getActionForEmailCampaigns', 'actionForSmsCampaigns' => 'getActionForSmsCampaigns', 'listId' => 'getListId', 'emailCampaignId' => 'getEmailCampaignId', 'smsCampaignId' => 'getSmsCampaignId'];
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
    const ACTION_FOR_CONTACTS_ALL_CONTACTS = 'allContacts';
    const ACTION_FOR_CONTACTS_SUBSCRIBED = 'subscribed';
    const ACTION_FOR_CONTACTS_UNSUBSCRIBED = 'unsubscribed';
    const ACTION_FOR_CONTACTS_UNSUBSCRIBED_PER_LIST = 'unsubscribedPerList';
    const ACTION_FOR_EMAIL_CAMPAIGNS_OPENERS = 'openers';
    const ACTION_FOR_EMAIL_CAMPAIGNS_NON_OPENERS = 'nonOpeners';
    const ACTION_FOR_EMAIL_CAMPAIGNS_CLICKERS = 'clickers';
    const ACTION_FOR_EMAIL_CAMPAIGNS_NON_CLICKERS = 'nonClickers';
    const ACTION_FOR_EMAIL_CAMPAIGNS_UNSUBSCRIBED = 'unsubscribed';
    const ACTION_FOR_EMAIL_CAMPAIGNS_HARD_BOUNCES = 'hardBounces';
    const ACTION_FOR_EMAIL_CAMPAIGNS_SOFT_BOUNCES = 'softBounces';
    const ACTION_FOR_SMS_CAMPAIGNS_HARD_BOUNCES = 'hardBounces';
    const ACTION_FOR_SMS_CAMPAIGNS_SOFT_BOUNCES = 'softBounces';
    const ACTION_FOR_SMS_CAMPAIGNS_UNSUBSCRIBED = 'unsubscribed';
    /**
     * Gets allowable values of the enum
     *
     * @return string[]
     */
    public function getActionForContactsAllowableValues()
    {
        return [self::ACTION_FOR_CONTACTS_ALL_CONTACTS, self::ACTION_FOR_CONTACTS_SUBSCRIBED, self::ACTION_FOR_CONTACTS_UNSUBSCRIBED, self::ACTION_FOR_CONTACTS_UNSUBSCRIBED_PER_LIST];
    }
    /**
     * Gets allowable values of the enum
     *
     * @return string[]
     */
    public function getActionForEmailCampaignsAllowableValues()
    {
        return [self::ACTION_FOR_EMAIL_CAMPAIGNS_OPENERS, self::ACTION_FOR_EMAIL_CAMPAIGNS_NON_OPENERS, self::ACTION_FOR_EMAIL_CAMPAIGNS_CLICKERS, self::ACTION_FOR_EMAIL_CAMPAIGNS_NON_CLICKERS, self::ACTION_FOR_EMAIL_CAMPAIGNS_UNSUBSCRIBED, self::ACTION_FOR_EMAIL_CAMPAIGNS_HARD_BOUNCES, self::ACTION_FOR_EMAIL_CAMPAIGNS_SOFT_BOUNCES];
    }
    /**
     * Gets allowable values of the enum
     *
     * @return string[]
     */
    public function getActionForSmsCampaignsAllowableValues()
    {
        return [self::ACTION_FOR_SMS_CAMPAIGNS_HARD_BOUNCES, self::ACTION_FOR_SMS_CAMPAIGNS_SOFT_BOUNCES, self::ACTION_FOR_SMS_CAMPAIGNS_UNSUBSCRIBED];
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
        $this->container['actionForContacts'] = isset($data['actionForContacts']) ? $data['actionForContacts'] : null;
        $this->container['actionForEmailCampaigns'] = isset($data['actionForEmailCampaigns']) ? $data['actionForEmailCampaigns'] : null;
        $this->container['actionForSmsCampaigns'] = isset($data['actionForSmsCampaigns']) ? $data['actionForSmsCampaigns'] : null;
        $this->container['listId'] = isset($data['listId']) ? $data['listId'] : null;
        $this->container['emailCampaignId'] = isset($data['emailCampaignId']) ? $data['emailCampaignId'] : null;
        $this->container['smsCampaignId'] = isset($data['smsCampaignId']) ? $data['smsCampaignId'] : null;
    }
    /**
     * Show all the invalid properties with reasons.
     *
     * @return array invalid properties with reasons
     */
    public function listInvalidProperties()
    {
        $invalidProperties = [];
        $allowedValues = $this->getActionForContactsAllowableValues();
        if (!\is_null($this->container['actionForContacts']) && !\in_array($this->container['actionForContacts'], $allowedValues, \true)) {
            $invalidProperties[] = \sprintf("invalid value for 'actionForContacts', must be one of '%s'", \implode("', '", $allowedValues));
        }
        $allowedValues = $this->getActionForEmailCampaignsAllowableValues();
        if (!\is_null($this->container['actionForEmailCampaigns']) && !\in_array($this->container['actionForEmailCampaigns'], $allowedValues, \true)) {
            $invalidProperties[] = \sprintf("invalid value for 'actionForEmailCampaigns', must be one of '%s'", \implode("', '", $allowedValues));
        }
        $allowedValues = $this->getActionForSmsCampaignsAllowableValues();
        if (!\is_null($this->container['actionForSmsCampaigns']) && !\in_array($this->container['actionForSmsCampaigns'], $allowedValues, \true)) {
            $invalidProperties[] = \sprintf("invalid value for 'actionForSmsCampaigns', must be one of '%s'", \implode("', '", $allowedValues));
        }
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
     * Gets actionForContacts
     *
     * @return string
     */
    public function getActionForContacts()
    {
        return $this->container['actionForContacts'];
    }
    /**
     * Sets actionForContacts
     *
     * @param string $actionForContacts Mandatory if neither actionForEmailCampaigns nor actionForSmsCampaigns is passed. This will export the contacts on the basis of provided action applied on contacts as per the list id. * allContacts - Fetch the list of all contacts for a particular list. * subscribed & unsubscribed - Fetch the list of subscribed / unsubscribed (blacklisted via any means) contacts for a particular list. * unsubscribedPerList - Fetch the list of contacts that are unsubscribed from a particular list only.
     *
     * @return $this
     */
    public function setActionForContacts($actionForContacts)
    {
        $allowedValues = $this->getActionForContactsAllowableValues();
        if (!\is_null($actionForContacts) && !\in_array($actionForContacts, $allowedValues, \true)) {
            throw new \InvalidArgumentException(\sprintf("Invalid value for 'actionForContacts', must be one of '%s'", \implode("', '", $allowedValues)));
        }
        $this->container['actionForContacts'] = $actionForContacts;
        return $this;
    }
    /**
     * Gets actionForEmailCampaigns
     *
     * @return string
     */
    public function getActionForEmailCampaigns()
    {
        return $this->container['actionForEmailCampaigns'];
    }
    /**
     * Sets actionForEmailCampaigns
     *
     * @param string $actionForEmailCampaigns Mandatory if neither actionForContacts nor actionForSmsCampaigns is passed. This will export the contacts on the basis of provided action applied on email campaigns. * openers & nonOpeners - emailCampaignId is mandatory. Fetch the list of readers / non-readers for a particular email campaign. * clickers & nonClickers - emailCampaignId is mandatory. Fetch the list of clickers / non-clickers for a particular email campaign. * unsubscribed - emailCampaignId is mandatory. Fetch the list of all unsubscribed (blacklisted via any means) contacts for a particular email campaign. * hardBounces & softBounces - emailCampaignId is optional. Fetch the list of hard bounces / soft bounces for a particular / all email campaign(s).
     *
     * @return $this
     */
    public function setActionForEmailCampaigns($actionForEmailCampaigns)
    {
        $allowedValues = $this->getActionForEmailCampaignsAllowableValues();
        if (!\is_null($actionForEmailCampaigns) && !\in_array($actionForEmailCampaigns, $allowedValues, \true)) {
            throw new \InvalidArgumentException(\sprintf("Invalid value for 'actionForEmailCampaigns', must be one of '%s'", \implode("', '", $allowedValues)));
        }
        $this->container['actionForEmailCampaigns'] = $actionForEmailCampaigns;
        return $this;
    }
    /**
     * Gets actionForSmsCampaigns
     *
     * @return string
     */
    public function getActionForSmsCampaigns()
    {
        return $this->container['actionForSmsCampaigns'];
    }
    /**
     * Sets actionForSmsCampaigns
     *
     * @param string $actionForSmsCampaigns Mandatory if neither actionForContacts nor actionForEmailCampaigns is passed. This will export the contacts on the basis of provided action applied on sms campaigns. * unsubscribed - Fetch the list of all unsubscribed (blacklisted via any means) contacts for all / particular sms campaigns. * hardBounces & softBounces - Fetch the list of hard bounces / soft bounces for all / particular sms campaigns.
     *
     * @return $this
     */
    public function setActionForSmsCampaigns($actionForSmsCampaigns)
    {
        $allowedValues = $this->getActionForSmsCampaignsAllowableValues();
        if (!\is_null($actionForSmsCampaigns) && !\in_array($actionForSmsCampaigns, $allowedValues, \true)) {
            throw new \InvalidArgumentException(\sprintf("Invalid value for 'actionForSmsCampaigns', must be one of '%s'", \implode("', '", $allowedValues)));
        }
        $this->container['actionForSmsCampaigns'] = $actionForSmsCampaigns;
        return $this;
    }
    /**
     * Gets listId
     *
     * @return int
     */
    public function getListId()
    {
        return $this->container['listId'];
    }
    /**
     * Sets listId
     *
     * @param int $listId Mandatory if actionForContacts is passed, ignored otherwise. Id of the list for which the corresponding action shall be applied in the filter.
     *
     * @return $this
     */
    public function setListId($listId)
    {
        $this->container['listId'] = $listId;
        return $this;
    }
    /**
     * Gets emailCampaignId
     *
     * @return int
     */
    public function getEmailCampaignId()
    {
        return $this->container['emailCampaignId'];
    }
    /**
     * Sets emailCampaignId
     *
     * @param int $emailCampaignId Considered only if actionForEmailCampaigns is passed, ignored otherwise. Mandatory if action is one of the following - openers, nonOpeners, clickers, nonClickers, unsubscribed. The id of the email campaign for which the corresponding action shall be applied in the filter.
     *
     * @return $this
     */
    public function setEmailCampaignId($emailCampaignId)
    {
        $this->container['emailCampaignId'] = $emailCampaignId;
        return $this;
    }
    /**
     * Gets smsCampaignId
     *
     * @return int
     */
    public function getSmsCampaignId()
    {
        return $this->container['smsCampaignId'];
    }
    /**
     * Sets smsCampaignId
     *
     * @param int $smsCampaignId Considered only if actionForSmsCampaigns is passed, ignored otherwise. The id of sms campaign for which the corresponding action shall be applied in the filter.
     *
     * @return $this
     */
    public function setSmsCampaignId($smsCampaignId)
    {
        $this->container['smsCampaignId'] = $smsCampaignId;
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