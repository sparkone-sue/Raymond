/* Native website UI, Google Forms submission. Google does not provide a public confirmation API. */
(function(){
 const form=document.getElementById('raymond-native-form');if(!form)return;
 const frame=document.getElementById('raymond-google-response');
 const status=document.getElementById('native-form-status');
 const button=form.querySelector('button[type="submit"]');
 let pending=false, initial=true;
 frame.addEventListener('load',function(){
   if(initial){initial=false;return;}
   if(!pending)return;
   pending=false;button.disabled=false;
   status.textContent='Your inquiry has been submitted. Please note: Google Forms does not provide independent receipt verification here. If you do not hear back, contact Raymond directly.';
   form.reset();
 });
 form.addEventListener('submit',function(e){
   if(!form.reportValidity()){e.preventDefault();return;}
   pending=true;button.disabled=true;
   status.textContent='Submitting your inquiry to Google Forms…';
   window.setTimeout(function(){if(pending){pending=false;button.disabled=false;status.textContent='We could not confirm the submission. Please use the original Google Form link below or contact Raymond directly.';}},15000);
 });
})();
