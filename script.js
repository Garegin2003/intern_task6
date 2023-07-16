const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');
const dropArea = document.querySelector('.drop-area');

let percent = 0;
let fileIndex = 0;
let step = 1;

uploadBtn.addEventListener('click', uploadFiles);
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
  const files = e.dataTransfer.files;
  input.files = files;
}

function uploadFiles() {
  
  const files = input.files;

  if (files.length === 0) {
    return;
  }

  const maxParallelUploads = 40;
  const startIndex = (step - 1) * maxParallelUploads;
  const endIndex = Math.min(startIndex + maxParallelUploads, files.length);

  for (let i = startIndex; i < endIndex; i++) {
    createProgressElement();

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('files', files[i]);

    xhr.open('POST', 'http://localhost:3000/upload', true);
    xhr.upload.addEventListener('progress', handleProgress);
    xhr.onreadystatechange = handleStateChange;
    xhr.send(formData);

    input.value = '';
  }
}

function createProgressElement() {
  const progressElement = document.createElement('div');
  progressElement.classList.add('container__progress');
  progressElement.innerHTML = `
    <div style="width: ${percent}%" class="container__item"></div>
  `;
  progress.appendChild(progressElement);
}

function handleProgress(e) {
  if (e.lengthComputable) {
    percent = ((e.loaded / e.total) * 100).toFixed(2);
    updateProgressElementsWidth();
    console.log(percent);
  }
}

function updateProgressElementsWidth() {
  const progressElements = document.querySelectorAll('.container__item');
  progressElements.forEach((element) => {
    element.style.width = percent + '%';
  });
}

function handleStateChange() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log('ok');
    } else {
      console.log('hajox');
    }

    if (fileIndex === endIndex - 1) {
      if (endIndex < files.length) {
        fileIndex = endIndex;
        step++;
        uploadFiles();
      }
    }

    fileIndex++;
  }
}
