"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.Edit=void 0;const i18n_1=require("@wordpress/i18n"),element_1=require("@wordpress/element"),components_1=require("@wordpress/components"),data_1=require("@wordpress/data"),core_data_1=require("@wordpress/core-data"),compose_1=require("@wordpress/compose"),classnames_1=__importDefault(require("classnames")),block_editor_1=require("@wordpress/block-editor"),paragraph_rtl_control_1=require("./paragraph-rtl-control"),constants_1=require("./constants");function Edit({attributes:e,setAttributes:t}){const{align:o,allowedFormats:r,direction:n,label:a}=e,l=(0,block_editor_1.useBlockProps)({style:{direction:n}}),s=(0,compose_1.useInstanceId)(Edit,"wp-block-woocommerce-product-summary-field__content"),[c,i]=(0,core_data_1.useEntityProp)("postType","product","short_description"),{clearSelectedBlock:_}=(0,data_1.useDispatch)(block_editor_1.store);return(0,element_1.createElement)("div",{className:"wp-block wp-block-woocommerce-product-summary-field-wrapper"},(0,element_1.createElement)(block_editor_1.BlockControls,{group:"block"},(0,element_1.createElement)(block_editor_1.AlignmentControl,{alignmentControls:constants_1.ALIGNMENT_CONTROLS,value:o,onChange:function(e){t({align:e})}}),(0,element_1.createElement)(paragraph_rtl_control_1.ParagraphRTLControl,{direction:n,onChange:function(e){t({direction:e})}})),(0,element_1.createElement)(components_1.BaseControl,{id:s.toString(),label:a||(0,i18n_1.__)("Summary","woocommerce"),help:(0,i18n_1.__)("Summarize this product in 1-2 short sentences. We'll show it at the top of the page.","woocommerce")},(0,element_1.createElement)("div",{...l},(0,element_1.createElement)(block_editor_1.RichText,{id:s.toString(),identifier:"content",tagName:"p",value:c,onChange:i,"data-empty":Boolean(c),className:(0,classnames_1.default)("components-summary-control",{[`has-text-align-${o}`]:o}),dir:n,allowedFormats:r,onBlur:function(e){var t;(null===(t=e.relatedTarget)||void 0===t?void 0:t.closest(".block-editor-block-contextual-toolbar"))||_()}}))))}exports.Edit=Edit;