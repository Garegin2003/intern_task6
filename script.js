const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');
const dropArea = document.querySelector('.drop-area');
const maxParallelUploads = 3;
const files = [];
const selectedFiles = [];

let fileIndex = 0;
let step = 0;
let progressContainers = [];
let uploadStarted = false;
let finish = 0;

uploadBtn.addEventListener('click', () => uploadFiles(input.files));
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('dragleave', handleDragLeave);
dropArea.addEventListener('drop', handleDrop);
input.addEventListener('change', handleChange);

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
  const filesDropped = e.dataTransfer.files || e.target.files;
  selectedFiles.push(...filesDropped);
}

function handleChange(e) {
  selectedFiles.push(...e.target.files);
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
  files.push(...selectedFiles);

  input.value = '';

  const existingProgressContainers = document.querySelectorAll('.container__progress');
  const numExistingContainers = existingProgressContainers.length;

  for (let i = numExistingContainers; i < files.length; i++) {
    const containerProgress = createProgressContainer();
    progressContainers.push(containerProgress);
  }

  if (!uploadStarted) {
    uploadStarted = true;
    step = 0;
    upload(0);
  }
}

function upload(startIndex) {
  let endIndex = Math.min(startIndex + maxParallelUploads, files.length);

  for (let i = startIndex; i < endIndex; i++) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('files', files[i]);

    xhr.open('POST', 'http://localhost:3000/upload', true);

    xhr.upload.addEventListener('progress', (e) => {
      const containerProgress = progressContainers[i];

      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(2);
        updateProgress(containerProgress, percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
        } else {
          const containerProgress = progressContainers[i];
          const containerItem = containerProgress.querySelector('.container__item');
          containerItem.classList.add('error');
          containerItem.innerText = 'UploadFailed';
        }

        fileIndex++;
        finish++;

        if (finish === files.length) {
          progressContainers = [];
          uploadStarted = false;
          console.log('finish');
          fileIndex = 0;
          return;
        } else if (fileIndex === endIndex) {
          step++;
          uploadStarted = true;
          upload(endIndex);
        }
      }
    };

    xhr.send(formData);
  }
}
