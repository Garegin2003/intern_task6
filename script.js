const uploadBtn = document.querySelector('.upload-btn');


uploadBtn.addEventListener('click', uploadFiles);

function uploadFiles() {
  const files = document.querySelector('input[type=file]').files;
  

  if (files.length === 0) {
    alert('Please select files to upload.');
    return;
  }
  

  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  

  fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => {

    if (response.ok) {
      console.log('Files uploaded successfully!');
    } else {
      console.log('Error uploading files.');
    }
  })
  .catch(error => {
    console.log('An error occurred while uploading files.');
  });
}
