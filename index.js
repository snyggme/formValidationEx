var resultContainer = document.querySelector("#resultContainer");
var yaDomains = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'];

// returns an HTTP request object
function getRequestObject() {
	if (window.XMLHttpRequest) {
    	return (new XMLHttpRequest());
  	} 
  	else if (window.ActiveXObject) {
    	// for very old IE browsers (optional)
    	return (new ActiveXObject("Microsoft.XMLHTTP"));
  	} else {
		alert("Ajax is not supported!");
    	return(null); 
  	}
}

// makes an ajax GET request to 'requestUrl'
function sendGetRequest (requestUrl, responseHandler, isJsonResponse) {
	var request = getRequestObject();
    request.onreadystatechange = function() { 
		handleResponse(request, responseHandler, isJsonResponse); 
    };
    request.open("GET", requestUrl, true);
    request.send(null); // for POST only
}

// only calls user provided 'responseHandler'
// function if response is ready
// and not an error
function handleResponse(request, responseHandler, isJsonResponse) {
	if ((request.readyState == 4) && (request.status == 200)) {
    	// Default to isJsonResponse = true
    	if (isJsonResponse == undefined) {
      		isJsonResponse = true;
    	}

    	if (isJsonResponse) {
      		responseHandler(JSON.parse(request.responseText));
    	} else {
      		responseHandler(request.responseText);
    	}
  }
}

// handler for different server responses
function serverResponseHandler (response) {
	resultContainer.className = response.status;

	if (response.status == "success") {
		resultContainer.innerHTML = "Success";
	}
	if (response.status == "error") {
		resultContainer.innerHTML = response.reason;
	}
	// warning! can cause recursion
	if (response.status == "progress") {
		resultContainer.innerHTML = 'Attempt to connect to server...';

		setTimeout(function () {
			sendGetRequest(myForm.action, serverResponseHandler);
		}, response.timeout);

	}
}

// constructor for MyForm obj
// formId - specific id of form
// btnId - id of submit button of the form
// fioName - name attribute of the FIO form input
// emailName - name attribute of the EMAIL form input
// phoneName - name attribute of the PHONE form input
function MyForm (formId, btnId, fioName, emailName, phoneName) {

	var myForm = document.querySelector(formId);
	var btn = document.querySelector(btnId);

	var fio = myForm[fioName];
	var email = myForm[emailName];
	var phone = myForm[phoneName];

	var validity = {
		isValid: false,
		errorFields : []
	};

 	this.validate = function () {
 		return validity;
 	};

 	this.getData = function () {
 		return {
 			fio : fio.value,
 			email : email.value,
 			phone : phone.value
 		}
 	}

 	this.setData = function (inputObj) {
 		if (fioName in inputObj) {
 			fio.value = inputObj[fioName];
 		}
 		if (emailName in inputObj) {
 			email.value = inputObj[emailName];
 		}
 		if (phoneName in inputObj) {
 			phone.value = inputObj[phoneName];
 		}
 	}

 	this.submit = function (event) {
		var errorElements = myForm.querySelectorAll('.error');
		var count = 0;
		var pos = fio.value.indexOf(' ');

		var invalidityDescription = [];

		validity.isValid = true;
		validity.errorFields = [];
		// if any inputs have .error class, remove it
		if (errorElements.length) {
			for (var i = 0; i < errorElements.length; i++) {
				errorElements[i].classList.remove('error');
			};
		}
		//fio form input validation, looking for spaces entries
		while (pos !== -1) {
			count++;
			pos = fio.value.indexOf(' ', pos + 1);
		}
		// check whether we have 2 spaces in fio input or not
		if (count < 2) {
			fio.classList.add('error');
			validity.isValid = false;
			validity.errorFields.push('fio input');

			invalidityDescription.push('Fio input must contain three words separate with spaces');  			
		// checking if we have numbers in fio input or not
		} else if (fio.value.match(/\d/g) != null) {
			
			fio.classList.add('error');

			if (validity.errorFields[validity.errorFields.length - 1] == 'fio input'){
					validity.errorFields[validity.errorFields.length - 1] = 'fio input';
				} else 
					validity.errorFields.push('fio input');

			validity.isValid = false;

			invalidityDescription.push('Fio input must contain no numbers'); 
		}

		var emailAt = email.value.indexOf('@');
		// check whether we have '@' in email input or not
		// if not add .error class 
		if (emailAt == -1) {
			email.classList.add('error'); 
			validity.isValid = false;
			validity.errorFields.push('e-mail input');

			invalidityDescription.push('Email input must contain @ sign');
		// check if we have 2 or more symbols in email name
		} else if (emailAt < 2) {
			email.classList.add('error'); 

			if (validity.errorFields[validity.errorFields.length - 1] == 'e-mail input'){
				validity.errorFields[validity.errorFields.length - 1] = 'e-mail input';
			} else 
				validity.errorFields.push('e-mail input');

			validity.isValid = false;

			invalidityDescription.push('Email name should contain at least 2 symbols');
		} else {
			count = 0;
			// if we have '@' continue validation of email input
			// check whether we have allowable email domains or not
			// if not add .error class
			for (var i = 0; i < yaDomains.length; i++) {
				if (email.value.indexOf(yaDomains[i], emailAt + 1) !== -1) {
					count++;
					break;
				}
			};
			// variable count != 0 when our input domain matches allowable values
			if (count == 0) {
				email.classList.add('error'); 

				if (validity.errorFields[validity.errorFields.length - 1] == 'e-mail input'){
					validity.errorFields[validity.errorFields.length - 1] = 'e-mail input';
				} else 
					validity.errorFields.push('e-mail input');

				validity.isValid = false;

				invalidityDescription.push('Email input must contain only allowable domains');
			}
		}
		// passing only +7(999)999-99-99 format
		var regexp = /^\+[\d]{1}\([\d]{3}\)[\d]{3}\-[\d]{2}\-[\d]{2}$/;
		// collect all numbers of the phone in array
		var numbersArray = phone.value.match(/\d/g);
		var sum = 0;

		if (!regexp.test(phone.value)) {
			phone.classList.add('error');
			validity.isValid = false;
			validity.errorFields.push('phone input');

			invalidityDescription.push('Phone number must match only +7(999)999-99-99 format');
		} else {
			// if phone number matches formatting
			// we need to check sum of all phone number
			for (var i = 0; i < numbersArray.length; i++) {
				sum += +numbersArray[i];
			};
			if (sum > 30) {
				phone.classList.add('error');

				if (validity.errorFields[validity.errorFields.length - 1] == 'phone input'){
					validity.errorFields[validity.errorFields.length - 1] = 'phone input';
				} else 
					validity.errorFields.push('phone input');
				
				validity.isValid = false;

				invalidityDescription.push('Sum of phone numbers is greater then 30');
			}
		}
		// check for validity, if have no errors send ajax request to form.action adress
		if (validity.isValid) {
			sendGetRequest(myForm.action, serverResponseHandler);
			btn.disabled = true;
		} else {
			resultContainer.innerHTML = "";

			for (var i = 0; i < invalidityDescription.length; i++) {
				resultContainer.innerHTML += invalidityDescription[i] + '<br><br>';
			};

		}
		// stop form from submitting
		event.preventDefault();	
	};
}

var formObj = new MyForm('#myForm', '#submitButton', 'fio', 'email', 'phone');

document.querySelector("#myForm").addEventListener('submit', formObj.submit);