const files = [];
const SERVER = 'http://localhost:3000/upload'
const maxParallelUploads = 3;
const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');
const dropArea = document.querySelector('.drop-area');


let fileIndex = 0;
let progressContainers = [];
let uploadStarted = false;
let step = 0;

input.addEventListener('change', handleChange);
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
  let file = e.dataTransfer.files;
  console.log(file);
  uploadFiles(file);
}

function handleChange() {
  const file = input.files;
  uploadFiles(file);
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

function updateProgress(containerItem,containerText, percent) {
 
  containerItem.style.width = percent + '%';
  containerText.textContent = percent;

  if (parseFloat(percent) === 100) {
    containerItem.classList.add('container__item--green');
  }
}

function uploadFiles(file) {
  files.push(...file);

  for (let i = 0; i < file.length; i++) {
    const containerProgress = createProgressContainer();
    progressContainers.push(containerProgress);
  }
  input.value = '';

  if (!uploadStarted) {
    uploadStarted = true;

    upload(0, files.length - step >= maxParallelUploads ? maxParallelUploads : files.length - step);
  }
}

function upload(startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('files', files[i]);

    xhr.open('POST', SERVER);

    const containerProgress = progressContainers[i];
    const containerItem = containerProgress.querySelector('.container__item');
    const containerText = containerProgress.querySelector('.container__text');

    xhr.upload.addEventListener('progress', (e) => {

      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(2);
        updateProgress(containerItem, containerText, percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          step++;
        } else {
          const containerProgress = progressContainers[i];
          const containerItem = containerProgress.querySelector('.container__item');
          containerItem.classList.add('container__item--error');
          containerItem.innerText = 'UploadFailed';
        }
        fileIndex++;

        if (step === files.length) {
          progressContainers = [];
          uploadStarted = false;
          fileIndex = 0;
          return;
        } else if (fileIndex === endIndex) {
          uploadStarted = true;
          upload(endIndex, files.length - step >= maxParallelUploads ? endIndex + maxParallelUploads : endIndex + files.length - step);
        }
      }
    };

    xhr.send(formData);
  }
}
