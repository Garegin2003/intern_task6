const files = [];
const SERVER = 'http://localhost:3000/upload'
const maxParallelUploads = 3;
const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');
const dropArea = document.querySelector('.drop-area');
const filteredFiles = ["", "text/javascript"]

let progressContainers = [];
let uploadStarted = false;
let step = 0;
let fileIndex = 0

input.addEventListener('change', handleUpload);
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('dragleave', handleDragLeave);
dropArea.addEventListener('drop', handleUpload);

function handleDragOver(e) {
  e.preventDefault();
  dropArea.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
}

function handleUpload(e) {
  e.preventDefault();

  dropArea.classList.remove('drag-over');

  const file = e.target.files || e.dataTransfer.files;
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

  progressContainers.push({
    containerItem,
    containerText: span
  })
}

function updateProgress(containerItem, containerText, percent) {

  containerItem.style.width = percent + '%';
  containerText.textContent = percent.toFixed(2);

  if (percent === 100) {
    containerItem.classList.add('container__item--green');
  }
}

const diff = (endIndex = 0) => {
  return files.length - step >= maxParallelUploads ? endIndex + maxParallelUploads : endIndex + files.length - step
}

function uploadFiles(file) {
  file = Array.from(file).filter(e => !filteredFiles.includes(e.type))
  files.push(...file);

  for (let i = 0; i < file.length; i++) {
    createProgressContainer();
  }

  input.value = '';

  if (!uploadStarted) {
    uploadStarted = true;
    upload(0, diff());
  }
}

function upload(startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('files', files[i]);

    xhr.open('POST', SERVER);

    const { containerItem, containerText } = progressContainers[i];

    xhr.upload.addEventListener('progress', (e) => {

      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100)
        updateProgress(containerItem, containerText, percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
        } else {
          const {containerItem} = progressContainers[i];
          containerItem.classList.add('container__item--error');
          containerItem.innerText = `UploadFailed ${xhr.status}`;
        }
        fileIndex++;
        step++;
        if (step === files.length) {
          progressContainers = [];
          uploadStarted = false;
          fileIndex = 0;
          return;
        } else if (fileIndex === endIndex) {
          uploadStarted = true;
          upload(endIndex, diff(endIndex));
        }
      }
    };

    xhr.send(formData);
  }
}