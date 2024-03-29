
document.addEventListener("DOMContentLoaded", function() {
    let resultCamera = null;
    let resultUpload = null;
    let finalres=null;
    // moving menu bar
    const menubg = document.querySelector('.menubg');
    const arrowIcon = document.getElementById('arrowIcon');
    let isMenuVisible = true;
    arrowIcon.addEventListener('click', function() {
        if (isMenuVisible) {
            menubg.style.left = '-150px';
            arrowIcon.classList.remove('fa-arrow-left');
            arrowIcon.classList.add('fa-arrow-right');
        } else {
            menubg.style.left = '0';
            arrowIcon.classList.remove('fa-arrow-right');
            arrowIcon.classList.add('fa-arrow-left');
        }
        isMenuVisible = !isMenuVisible;
    });


    //taking image from camera
    let video = document.querySelector('#video');
    let canvas = document.querySelector('#canvas');
    let context = canvas.getContext('2d');
    const start = document.querySelector('#camera');
    start.addEventListener('click', function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                video.srcObject = stream;
                video.play();
                
                video.addEventListener('click', function() {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    var picture = canvas.toDataURL("image/png");
                    canvas.remove();
                    sendToServer(picture);
                    stopAndClearVideo();
                });      
                
            });
        }
    });
    function stopAndClearVideo() {
        if (video.srcObject) {
            var tracks = video.srcObject.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
            video.srcObject = null;
        }
        
    }
    // taking image from input file
    
    document.getElementById('upload').addEventListener('change',function(event){
                      let image=event.target.files[0];
                      result=sendToServer_from_upload(image)
    })

    // sending image to server and getting back the result
    
    function sendToServer(imagedata){
        var result1=null;
        var data=JSON.stringify({image:imagedata});

        var options={
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        };
        fetch('/processImage_camera',options).then(function(response){
                                                                if (!response.ok) {throw new Error("Didn't get any response");}
                                                                return response.json();
                                                               }).then(function(data){
                                                                result1=data.prediction;
                                                                resultCamera=result1;
                                                                if(result1 !=null){
                                                                    document.getElementById('result').innerHTML=result1+' of ';
                                                                 }
                                                                return result1;
                                                                }).catch(function(error) {
                                                                    console.error('Error:', error);
                                                                });
    }
    //sending the data to server from upload type
    function sendToServer_from_upload(imagedata){
        var result2=null;
        let formData=new FormData()
        formData.append('image', imagedata);
        options={
            method:'POST',
            body:formData
        }

        fetch('/processImage_upload',options).then(function(response){
                                             if(!response.ok){throw new Error("Didn't get any response from server");}
                                             return response.json()}).then(function(data){
                                                 result2= data.prediction;
                                                 resultUpload=result2;
                                                 if(result2 !=null){
                                                    document.getElementById('result').innerHTML=result2+' of ';
                                                 }
                                                 return result2;
                                             }).catch(function(error){console.error('Error:', error);});
    };
    
    //taking quantity
    var protein=0;
    var todaycal=[];
    var weekcal=[];
    var monthcal=[];
    document.querySelector('#add-button').addEventListener('click',function(){
        var number=parseFloat(document.getElementById('quantity').value);
        var units=document.getElementById('inlineFormCustomSelect').value;

        if(resultUpload !=null){
            finalres=resultUpload;
            resultUpload=null;
        }
        else{
            finalres=resultCamera;
            resultCamera=null;
        }

        classes=['Bread', 'Egg', 'Meat', 'Noodles', 'Rice'];
        if (finalres === classes[0]) {
            if (units === 'slices') {
                protein = number * 2.2;
                todaycal.push(protein);
                updateDatabase(finalres,number,protein,units);
            } else {
                window.alert("Invalid measurement");
            }
        } else if (finalres === classes[1]) {
            if (units === 'small') {
                protein = number * 4.79;
                todaycal.push(protein);
                updateDatabase(finalres,number,protein,units);
            } else if (units === 'medium') {
                protein = number * 5.54;
                todaycal.push(protein);
                updateDatabase(finalres,number,protein,units);
            } else if (units === 'large') {
                protein = number * 6.3;
                todaycal.push(protein);
                updateDatabase(finalres,number,protein,units);
            } else {
                window.alert("Invalid measurement");
            }
            
        } else if (finalres === classes[2] || finalres === classes[3] || finalres === classes[4]) {
            if (units === 'grams') {
                if (finalres === classes[2]) {
                    protein =(number * 30)/100;
                    todaycal.push(protein);
                    updateDatabase(finalres,number,protein,units);
                } else if (finalres === classes[3]) {
                    protein = (number * 4.5)/100;
                    todaycal.push(protein);
                    updateDatabase(finalres,number,protein,units);
                } else if (finalres === classes[4]) {
                    protein = (number * 2.69)/100;
                    todaycal.push(protein);
                    updateDatabase(finalres=finalres,number=number,protein=protein,units=units);
                }
            } else {
                window.alert("Invalid measurement");
            }
        }
        updateIntakeDisplay(todaycal);
    });
    setInterval(checkAndReset, 60 * 1000);


   // function for summing the protien for a day
    function todaySum(todaycal){
        var todayTotalCal = 0;
        for (let i = 0; i < todaycal.length; i++) {
            todayTotalCal += todaycal[i];
        }
        return todayTotalCal.toFixed(2);
    }


    // function for updating the web with today's total calories
    function updateIntakeDisplay() {
        var todayTotalCal=todaySum(todaycal)
        document.querySelector('.intake').innerHTML = todayTotalCal + ' GRAMS';
    }


    //function to check and reset the arrays
    function checkAndReset(){
        var now = new Date();
        var lastReset = new Date(localStorage.getItem('lastReset'));
        var firstReset = new Date(localStorage.getItem('firstReset'));
        
        if (!firstReset) {
            localStorage.setItem('firstReset', now);
            firstReset = now;
        }
        
        var elapsedMonths = (now.getFullYear() - firstReset.getFullYear()) * 12 + now.getMonth() - firstReset.getMonth();
        if (elapsedMonths > 0) {
            monthcal = [];
            monthcal.push(todaySum(weekcal));
        }
        
        if (Math.floor((now - firstReset) / (24 * 60 * 60 * 1000)) % 7 === 0) {
            weekcal = [];
            weekcal.push(todaySum(todaycal));
        }
        
        if (!lastReset || now - lastReset >= 24 * 60 * 60 * 1000) {
            todaycal = [];
            localStorage.setItem('lastReset', now);
        }
    }

    //function to send the item and quantity to store in database

    function updateDatabase(finalres, number, protien, units) {
        var data = JSON.stringify({
            'item': finalres,
            'number': number,
            'protien': protien,
            'units': units
        });        
    
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        };
    
        fetch('/addToDatabase', options)
            .then(function(response) {
                console.log(response);
                if (!response.ok) {
                    throw new Error("Didn't get any response from server");
                }
                return response.json();
            })
            .then(function(data) {
                if (data.hasOwnProperty('message')) {
                    console.log('Data is inserted into the database');
                } else {
                    console.log('Error in inserting the data:', data.error);
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    }
    
    
    
});
