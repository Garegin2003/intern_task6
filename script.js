const uploadBtn = document.querySelector('.upload-btn');
const progress = document.querySelector('.container');
const input = document.querySelector('.drop-area__item');

let fileIndex = 0;
let step = 0;

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
  const files = e.dataTransfer.files;

  const dataTransfer = new DataTransfer();

  Array.from(input.files).forEach((file) => {
    dataTransfer.items.add(file);
  });

  Array.from(files).forEach((file) => {
    dataTransfer.items.add(file);
  });

  input.files = dataTransfer.files;
}

function uploadFiles() {
  const files = input.files;

  if (input.files.length === 0) {
    return;
  }

  const existingProgressContainers = document.querySelectorAll(
    '.container__progress'
  );
  const numExistingContainers = existingProgressContainers.length;

  const maxParallelUploads = 3;
  const startIndex = step * maxParallelUploads;
  const endIndex = Math.min(startIndex + maxParallelUploads, files.length);

  if (numExistingContainers === 0) {
    for (let i = 0; i < files.length; i++) {
      const containerProgress = document.createElement('div');
      containerProgress.classList.add('container__progress');
      containerProgress.innerHTML =
        '<div class="container__item"><span>0.00</span></div>';

      progress.appendChild(containerProgress);
    }
  }

  for (let i = startIndex; i < endIndex; i++) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('files', files[i]);

    xhr.open('POST', 'http://localhost:3000/upload', true);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const loaded = e.loaded;
        const total = e.total;
        const percent = ((loaded / total) * 100).toFixed(2);
        const containerProgress = document.querySelectorAll(
          '.container__progress'
        )[i];
        const containerItem =
          containerProgress.querySelector('.container__item');

        containerItem.style.width = percent + '%';
        containerItem.innerHTML = `<span class="container__text">${percent}</span>`;

        if (percent === '100.00') {
          containerItem.style.backgroundColor = '#437bf5';
        }
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('ok');
        } else {
          progress.innerHTML = '<p>chdarav</p>';
        }

        fileIndex++;
        if (fileIndex === files.length) {
          step = 0;
          fileIndex = 0;
          input.value = '';
        } else if (fileIndex === endIndex) {
          step++;
          uploadFiles();
        }
      }
    };

    xhr.send(formData);
  }
}
