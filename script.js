const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');
let maxParallelUploads = 3;
const files = []

let fileIndex = 0;
let step = 0;
let progressContainers = [];
let uploadStarted = false;
let arr = []

uploadBtn.addEventListener('click', uploadFiles);

const dropArea = document.querySelector('.drop-area');

dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('dragleave', handleDragLeave);
dropArea.addEventListener('drop', handleDrop);

function handleDragOver(e) {
  e.preventDefault();
  dropArea.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
  const files = [...e.dataTransfer.files];

  const dataTransfer = new DataTransfer();

  Array.from(files).forEach((file) => {
    dataTransfer.items.add(file);
  });

  Array.from(files).forEach((file) => {
    dataTransfer.items.add(file);
  });

  input.files = dataTransfer.files;
}

function createProgressContainer() {
  const containerProgress = document.createElement('div');
  containerProgress.classList.add('container__progress');

  const containerItem = document.createElement('div');
  containerItem.classList.add('container__item');

  const span = document.createElement('span');
  span.classList.add('container__text');
  span.textContent = '0.00';

  containerItem.appendChild(span);
  containerProgress.appendChild(containerItem);
  progress.appendChild(containerProgress);

  return containerProgress;
}

function updateProgress(containerProgress, percent) {
  if (containerProgress) {
    const containerItem = containerProgress.querySelector('.container__item');
    const containerText = containerProgress.querySelector('.container__text');
  
    containerItem.style.width = percent + '%';
    containerText.textContent = percent;
  
    if (parseFloat(percent) === 100) {
      containerItem.classList.add('completed');
    }
  }

}

 function uploadFiles() {
  files.push(...input.files);

  if (input.files.length === 0) {
    return;
  }
  input.files = null;
  input.value = ''
  console.log(files);


    const existingProgressContainers = document.querySelectorAll('.container__progress');
    const numExistingContainers = existingProgressContainers.length;
    for (let i = numExistingContainers; i < files.length; i++) { 
      const containerProgress = createProgressContainer();
      progressContainers.push(containerProgress);
      arr.push(containerProgress)
    }


  if (!uploadStarted) { 
    
    // if (arr.length >= 3) {
    //   maxParallelUploads = 3
    // }
    // else if(arr.length ===2) {
    //   maxParallelUploads = 2
    // }
    // else if(arr.length === 1) {
    //   maxParallelUploads = 1
    // }

    uploadStarted = true;
    upload();
  }


}
function upload() {



  let startIndex = step * maxParallelUploads;
  let endIndex = Math.min(startIndex + maxParallelUploads, files.length);

  if (endIndex - startIndex === 0) {
    console.log('fef');
    return
  }

  if (endIndex - startIndex === 1) {
    endIndex = startIndex + 1;
  }
  if (endIndex - startIndex === 2) {
    endIndex = startIndex + 2
  }

  for (let i = startIndex; i < endIndex; i++) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('files', files[i]);
    console.log(i);
    xhr.open('POST', 'http://localhost:3000/upload', true);


    xhr.upload.addEventListener('progress', (e) => {
    const containerProgress = progressContainers[i]

      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(2);
        updateProgress(containerProgress, percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('ok');
        } else {
          const containerProgress = progressContainers[i];
          const containerItem = containerProgress.querySelector('.container__item');
          containerItem.classList.add('error');
          containerItem.innerText = 'Upload Failed';
        }

        fileIndex++;
        if (fileIndex === files.length) {
          step = 0;
          fileIndex = 0;
          progressContainers = [];
          uploadStarted = false
          return
        } else if (fileIndex === endIndex) {
          step++;
          upload();
        }
      }
    };

    xhr.send(formData);
  }
}