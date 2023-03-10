(function(e, a) { for(var i in a) e[i] = a[i]; }(window, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/dropdown-hover.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/dropdown-hover.js":
/*!******************************!*\
  !*** ./js/dropdown-hover.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Add onHover event for dropdowns\n;\n\n(function ($) {\n  if (!$ || !$.fn) return;\n  var SELECTOR = '[data-bs-toggle=dropdown][data-trigger=hover]';\n  var TIMEOUT = 150;\n\n  function openDropdown($i) {\n    var t = $i.data('dd-timeout');\n\n    if (t) {\n      clearTimeout(t);\n      t = null;\n      $i.data('dd-timeout', t);\n    }\n\n    if ($i.attr('aria-expanded') !== 'true') $i.dropdown('toggle');\n  }\n\n  function closeDropdown($i) {\n    var t = $i.data('dd-timeout');\n    if (t) clearTimeout(t);\n    t = setTimeout(function () {\n      var t2 = $i.data('dd-timeout');\n\n      if (t2) {\n        clearTimeout(t2);\n        t2 = null;\n        $i.data('dd-timeout', t2);\n      }\n\n      if ($i.attr('aria-expanded') === 'true') $i.dropdown('toggle');\n    }, TIMEOUT);\n    $i.data('dd-timeout', t);\n  }\n\n  $(function () {\n    $('body').on('mouseenter', \"\".concat(SELECTOR, \", \").concat(SELECTOR, \" ~ .dropdown-menu\"), function () {\n      var $toggle = $(this).hasClass('dropdown-toggle') ? $(this) : $(this).prev('.dropdown-toggle');\n      var $dropdown = $(this).hasClass('dropdown-menu') ? $(this) : $(this).next('.dropdown-menu');\n      if (window.getComputedStyle($dropdown[0], null).getPropertyValue('position') === 'static') return; // Set hovered flag\n\n      if ($(this).is(SELECTOR)) {\n        $(this).data('hovered', true);\n      }\n\n      openDropdown($(this).hasClass('dropdown-toggle') ? $(this) : $(this).prev('.dropdown-toggle'));\n    }).on('mouseleave', \"\".concat(SELECTOR, \", \").concat(SELECTOR, \" ~ .dropdown-menu\"), function () {\n      var $toggle = $(this).hasClass('dropdown-toggle') ? $(this) : $(this).prev('.dropdown-toggle');\n      var $dropdown = $(this).hasClass('dropdown-menu') ? $(this) : $(this).next('.dropdown-menu');\n      if (window.getComputedStyle($dropdown[0], null).getPropertyValue('position') === 'static') return; // Remove hovered flag\n\n      if ($(this).is(SELECTOR)) {\n        $(this).data('hovered', false);\n      }\n\n      closeDropdown($(this).hasClass('dropdown-toggle') ? $(this) : $(this).prev('.dropdown-toggle'));\n    }).on('hide.bs.dropdown', function (e) {\n      if ($(this).find(SELECTOR).data('hovered')) e.preventDefault();\n    });\n  });\n})(window.jQuery);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9kcm9wZG93bi1ob3Zlci5qcz8wNjQ3Il0sIm5hbWVzIjpbIiQiLCJmbiIsIlNFTEVDVE9SIiwiVElNRU9VVCIsIm9wZW5Ecm9wZG93biIsIiRpIiwidCIsImRhdGEiLCJjbGVhclRpbWVvdXQiLCJhdHRyIiwiZHJvcGRvd24iLCJjbG9zZURyb3Bkb3duIiwic2V0VGltZW91dCIsInQyIiwib24iLCIkdG9nZ2xlIiwiaGFzQ2xhc3MiLCJwcmV2IiwiJGRyb3Bkb3duIiwibmV4dCIsIndpbmRvdyIsImdldENvbXB1dGVkU3R5bGUiLCJnZXRQcm9wZXJ0eVZhbHVlIiwiaXMiLCJlIiwiZmluZCIsInByZXZlbnREZWZhdWx0IiwialF1ZXJ5Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUVBOztBQUFDLENBQUMsVUFBVUEsQ0FBVixFQUFhO0VBQ2IsSUFBSSxDQUFDQSxDQUFELElBQU0sQ0FBQ0EsQ0FBQyxDQUFDQyxFQUFiLEVBQWlCO0VBRWpCLElBQU1DLFFBQVEsR0FBRywrQ0FBakI7RUFDQSxJQUFNQyxPQUFPLEdBQUcsR0FBaEI7O0VBRUEsU0FBU0MsWUFBVCxDQUFzQkMsRUFBdEIsRUFBMEI7SUFDeEIsSUFBSUMsQ0FBQyxHQUFHRCxFQUFFLENBQUNFLElBQUgsQ0FBUSxZQUFSLENBQVI7O0lBRUEsSUFBSUQsQ0FBSixFQUFPO01BQ0xFLFlBQVksQ0FBQ0YsQ0FBRCxDQUFaO01BQ0FBLENBQUMsR0FBRyxJQUFKO01BQ0FELEVBQUUsQ0FBQ0UsSUFBSCxDQUFRLFlBQVIsRUFBc0JELENBQXRCO0lBQ0Q7O0lBRUQsSUFBSUQsRUFBRSxDQUFDSSxJQUFILENBQVEsZUFBUixNQUE2QixNQUFqQyxFQUF5Q0osRUFBRSxDQUFDSyxRQUFILENBQVksUUFBWjtFQUMxQzs7RUFFRCxTQUFTQyxhQUFULENBQXVCTixFQUF2QixFQUEyQjtJQUN6QixJQUFJQyxDQUFDLEdBQUdELEVBQUUsQ0FBQ0UsSUFBSCxDQUFRLFlBQVIsQ0FBUjtJQUVBLElB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QyxDQUFDLElBQUQsQ0FBRCxDQUFRTyxJQUFSLENBQWEsU0FBYixFQUF3QixLQUF4QjtNQUNEOztNQUVESSxhQUFhLENBQUNYLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUWdCLFFBQVIsQ0FBaUIsaUJBQWpCLElBQXNDaEIsQ0FBQyxDQUFDLElBQUQsQ0FBdkMsR0FBZ0RBLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUWlCLElBQVIsQ0FBYSxrQkFBYixDQUFqRCxDQUFiO0lBQ0QsQ0ExQkgsRUEyQkdILEVBM0JILENBMkJNLGtCQTNCTixFQTJCMEIsVUFBVVUsQ0FBVixFQUFhO01BQ25DLElBQUl4QixDQUFDLENBQUMsSUFBRCxDQUFELENBQVF5QixJQUFSLENBQWF2QixRQUFiLEVBQXVCSyxJQUF2QixDQUE0QixTQUE1QixDQUFKLEVBQTRDaUIsQ0FBQyxDQUFDRSxjQUFGO0lBQzdDLENBN0JIO0VBOEJELENBL0JBLENBQUQ7QUFnQ0QsQ0F0RUEsRUFzRUVOLE1BQU0sQ0FBQ08sTUF0RVQiLCJmaWxlIjoiLi9qcy9kcm9wZG93bi1ob3Zlci5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEFkZCBvbkhvdmVyIGV2ZW50IGZvciBkcm9wZG93bnNcclxuXHJcbjsoZnVuY3Rpb24gKCQpIHtcclxuICBpZiAoISQgfHwgISQuZm4pIHJldHVyblxyXG5cclxuICBjb25zdCBTRUxFQ1RPUiA9ICdbZGF0YS1icy10b2dnbGU9ZHJvcGRvd25dW2RhdGEtdHJpZ2dlcj1ob3Zlcl0nXHJcbiAgY29uc3QgVElNRU9VVCA9IDE1MFxyXG5cclxuICBmdW5jdGlvbiBvcGVuRHJvcGRvd24oJGkpIHtcclxuICAgIGxldCB0ID0gJGkuZGF0YSgnZGQtdGltZW91dCcpXHJcblxyXG4gICAgaWYgKHQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHQpXHJcbiAgICAgIHQgPSBudWxsXHJcbiAgICAgICRpLmRhdGEoJ2RkLXRpbWVvdXQnLCB0KVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgkaS5hdHRyKCdhcmlhLWV4cGFuZGVkJykgIT09ICd0cnVlJykgJGkuZHJvcGRvd24oJ3RvZ2dsZScpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZURyb3Bkb3duKCRpKSB7XHJcbiAgICBsZXQgdCA9ICRpLmRhdGEoJ2RkLXRpbWVvdXQnKVxyXG5cclxuICAgIGlmICh0KSBjbGVhclRpbWVvdXQodClcclxuXHJcbiAgICB0ID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGxldCB0MiA9ICRpLmRhdGEoJ2RkLXRpbWVvdXQnKVxyXG5cclxuICAgICAgaWYgKHQyKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQyKVxyXG4gICAgICAgIHQyID0gbnVsbFxyXG4gICAgICAgICRpLmRhdGEoJ2RkLXRpbWVvdXQnLCB0MilcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCRpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gJ3RydWUnKSAkaS5kcm9wZG93bigndG9nZ2xlJylcclxuICAgIH0sIFRJTUVPVVQpXHJcblxyXG4gICAgJGkuZGF0YSgnZGQtdGltZW91dCcsIHQpXHJcbiAgfVxyXG5cclxuICAkKGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKVxyXG4gICAgICAub24oJ21vdXNlZW50ZXInLCBgJHtTRUxFQ1RPUn0sICR7U0VMRUNUT1J9IH4gLmRyb3Bkb3duLW1lbnVgLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgJHRvZ2dsZSA9ICQodGhpcykuaGFzQ2xhc3MoJ2Ryb3Bkb3duLXRvZ2dsZScpID8gJCh0aGlzKSA6ICQodGhpcykucHJldignLmRyb3Bkb3duLXRvZ2dsZScpXHJcbiAgICAgICAgY29uc3QgJGRyb3Bkb3duID0gJCh0aGlzKS5oYXNDbGFzcygnZHJvcGRvd24tbWVudScpID8gJCh0aGlzKSA6ICQodGhpcykubmV4dCgnLmRyb3Bkb3duLW1lbnUnKVxyXG5cclxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoJGRyb3Bkb3duWzBdLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykgcmV0dXJuXHJcblxyXG4gICAgICAgIC8vIFNldCBob3ZlcmVkIGZsYWdcclxuICAgICAgICBpZiAoJCh0aGlzKS5pcyhTRUxFQ1RPUikpIHtcclxuICAgICAgICAgICQodGhpcykuZGF0YSgnaG92ZXJlZCcsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuRHJvcGRvd24oJCh0aGlzKS5oYXNDbGFzcygnZHJvcGRvd24tdG9nZ2xlJykgPyAkKHRoaXMpIDogJCh0aGlzKS5wcmV2KCcuZHJvcGRvd24tdG9nZ2xlJykpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignbW91c2VsZWF2ZScsIGAke1NFTEVDVE9SfSwgJHtTRUxFQ1RPUn0gfiAuZHJvcGRvd24tbWVudWAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zdCAkdG9nZ2xlID0gJCh0aGlzKS5oYXNDbGFzcygnZHJvcGRvd24tdG9nZ2xlJykgPyAkKHRoaXMpIDogJCh0aGlzKS5wcmV2KCcuZHJvcGRvd24tdG9nZ2xlJylcclxuICAgICAgICBjb25zdCAkZHJvcGRvd24gPSAkKHRoaXMpLmhhc0NsYXNzKCdkcm9wZG93bi1tZW51JykgPyAkKHRoaXMpIDogJCh0aGlzKS5uZXh0KCcuZHJvcGRvd24tbWVudScpXHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkZHJvcGRvd25bMF0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGhvdmVyZWQgZmxhZ1xyXG4gICAgICAgIGlmICgkKHRoaXMpLmlzKFNFTEVDVE9SKSkge1xyXG4gICAgICAgICAgJCh0aGlzKS5kYXRhKCdob3ZlcmVkJywgZmFsc2UpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbG9zZURyb3Bkb3duKCQodGhpcykuaGFzQ2xhc3MoJ2Ryb3Bkb3duLXRvZ2dsZScpID8gJCh0aGlzKSA6ICQodGhpcykucHJldignLmRyb3Bkb3duLXRvZ2dsZScpKVxyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2hpZGUuYnMuZHJvcGRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKHRoaXMpLmZpbmQoU0VMRUNUT1IpLmRhdGEoJ2hvdmVyZWQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgIH0pXHJcbiAgfSlcclxufSkod2luZG93LmpRdWVyeSlcclxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./js/dropdown-hover.js\n");

/***/ })

/******/ })));