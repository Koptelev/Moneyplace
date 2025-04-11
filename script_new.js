document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clientForm');
    if (!form) return console.error("Форма не найдена!");
  
    // Универсальная функция для переключения видимости
    const toggleVisibility = (element, show) => {
      element.style.display = show ? 'block' : 'none';
    };
  
    // Переключение секций по формату работы
    const selfSection = document.getElementById('selfWorkSection');
    const delegateSection = document.getElementById('delegateSection');
    document.querySelectorAll('input[name="workFormat"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const isSelf = e.target.value === 'self';
        toggleVisibility(selfSection, isSelf);
        toggleVisibility(delegateSection, !isSelf);
      });
    });
  
    // Обработка чекбоксов «Другое»
    document.querySelectorAll('input[data-other]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const targetName = checkbox.getAttribute('data-target');
        if (!targetName) return;
        const inputField = form.querySelector(`input[name="${targetName}"]`);
        if (inputField) {
          toggleVisibility(inputField.parentElement, checkbox.checked);
          if (checkbox.checked) inputField.focus();
        }
      });
    });
  
    // Обработка дополнительных полей для радио-кнопок
    document.querySelectorAll('input[name="productType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const productDescInput = document.getElementById('productDescriptionInput');
        toggleVisibility(productDescInput, true);
        productDescInput.querySelector('input').focus();
      });
    });
    document.querySelectorAll('input[name="positionsCount"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const positionsInput = document.getElementById('positionsCountInput');
        toggleVisibility(positionsInput, e.target.value === 'more_150');
      });
    });
    document.querySelectorAll('input[name="matrixExpansion"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const expansionInput = document.getElementById('expansionDetailsInput');
        toggleVisibility(expansionInput, e.target.value === 'yes');
      });
    });
    document.querySelectorAll('input[name="marketplaceProcess"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const otherProcessInput = document.getElementById('otherProcessInput');
        toggleVisibility(otherProcessInput, e.target.value === 'other');
      });
    });
  
    // Функции для работы с группами приоритетов
    const updatePriorityGroup = (priorityGroup, checkboxGroup) => {
      priorityGroup.innerHTML = '';
      const checkboxes = Array.from(checkboxGroup.querySelectorAll('input[type="checkbox"]:checked'));
      checkboxes.forEach((checkbox, index) => {
        const priorityItem = document.createElement('div');
        priorityItem.className = 'priority-item';
        priorityItem.dataset.value = checkbox.value;
        priorityItem.innerHTML = `
          <div class="priority-number">${index + 1}</div>
          <div class="priority-text">${checkbox.nextElementSibling.textContent}</div>
          <div class="priority-controls">
            <button type="button" class="priority-btn" data-direction="up" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="priority-btn" data-direction="down" ${index === checkboxes.length - 1 ? 'disabled' : ''}>↓</button>
          </div>
        `;
        priorityItem.querySelectorAll('.priority-btn').forEach(btn => {
          btn.addEventListener('click', () => movePriorityItem(btn, priorityGroup, checkboxGroup));
        });
        priorityGroup.appendChild(priorityItem);
      });
      const hiddenInput = priorityGroup.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        const priorities = Array.from(priorityGroup.querySelectorAll('.priority-item'))
                              .map(item => item.dataset.value);
        hiddenInput.value = JSON.stringify(priorities);
      }
    };
  
    const movePriorityItem = (button, priorityGroup, checkboxGroup) => {
      const priorityItem = button.closest('.priority-item');
      const items = Array.from(priorityGroup.querySelectorAll('.priority-item'));
      const currentIndex = items.indexOf(priorityItem);
      const direction = button.getAttribute('data-direction');
      if (direction === 'up' && currentIndex > 0) {
        priorityGroup.insertBefore(priorityItem, items[currentIndex - 1]);
      } else if (direction === 'down' && currentIndex < items.length - 1) {
        priorityGroup.insertBefore(priorityItem, items[currentIndex + 2]);
      }
      items.forEach((item, index) => {
        item.querySelector('.priority-number').textContent = index + 1;
        const [upBtn, downBtn] = item.querySelectorAll('.priority-btn');
        upBtn.disabled = index === 0;
        downBtn.disabled = index === items.length - 1;
      });
      const hiddenInput = priorityGroup.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        const priorities = Array.from(priorityGroup.querySelectorAll('.priority-item'))
                              .map(item => item.dataset.value);
        hiddenInput.value = JSON.stringify(priorities);
      }
    };
  
    // Инициализация обработки приоритетов для заданных групп
    const initializePriorityHandling = (checkboxGroupSelector, priorityGroupId) => {
      const checkboxGroup = document.querySelector(checkboxGroupSelector);
      const priorityGroup = document.getElementById(priorityGroupId);
      if (!checkboxGroup || !priorityGroup) return;
      checkboxGroup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => updatePriorityGroup(priorityGroup, checkboxGroup));
      });
    };
    initializePriorityHandling('#supportProcessGroup', 'supportProcessPriority');
    initializePriorityHandling('#newArticlesGroup', 'newArticlesPriority');
    initializePriorityHandling('#matrixOptimizationGroup', 'matrixOptimizationPriority');
  
    // Сброс формы по клику на логотип
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        form.reset();
        document.querySelectorAll('.hidden-section').forEach(section => section.classList.add('hidden'));
        document.querySelectorAll('.text-input').forEach(input => input.classList.add('hidden'));
        document.querySelectorAll('.priority-group').forEach(group => group.innerHTML = '');
        window.scrollTo(0, 0);
      });
    }
  
    // Формирование таблицы результатов из данных формы
    const createResultsTable = (formData) => {
      const workFormat = formData.get('workFormat');
      if (!workFormat) return '';
      const workFormatText = workFormat === 'self'
                             ? 'Самостоятельная работа с сервисом'
                             : 'Делегировать ведение магазина нашей команде';
      let resultsHtml = `<div class="results-container">
        <div class="results-item">
          <div class="results-label">Формат работы:</div>
          <div class="results-value">${workFormatText}</div>
        </div>`;
  
      if (workFormat === 'self') {
        // Функция для обработки групп чекбоксов
        const processList = (fieldName, labelText, mapping) => {
          const checkboxes = Array.from(form.querySelectorAll(`input[name="${fieldName}"]:checked`));
          if (checkboxes.length === 0) return '';
          const items = checkboxes.map(checkbox => {
            if (checkbox.value === 'other') {
              const otherValue = formData.get(form.querySelector(`input[data-target="other${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}"]`)?.getAttribute('data-target')) || '';
              return otherValue || 'Другое';
            }
            return mapping[checkbox.value] || checkbox.value;
          });
          return `<div class="results-item">
            <div class="results-label">${labelText}:</div>
            <div class="results-value">${items.join(', ')}</div>
          </div>`;
        };
  
        resultsHtml += processList('currentMarketplaces', 'На каких маркетплейсах сейчас работаете', {
          ozon: 'Ozon',
          wildberries: 'Wildberries',
          yandex: 'Яндекс Маркет',
          lamoda: 'Ламода',
          magnit: 'Магнит Маркет'
        });
        resultsHtml += processList('plannedMarketplaces', 'На каких маркетплейсах планируете работать', {
          ozon: 'Ozon',
          wildberries: 'Wildberries',
          yandex: 'Яндекс Маркет',
          lamoda: 'Ламода',
          magnit: 'Магнит Маркет'
        });
        resultsHtml += processList('analyticsServices', 'Какими сервисами аналитики пользуетесь', {
          mpstats: 'MPStats',
          mayak: 'Маяк',
          eggheads: 'EggHeads',
          marketguru: 'Маркетгуру',
          ozon_premium: 'Ozon Premium',
          none: 'Не использую'
        });
        resultsHtml += processList('importantBlocks', 'Какие блоки для Вас важны', {
          analytics: 'Аналитика своих магазинов',
          market_analysis: 'Внешняя аналитика конкурентов',
          promotion: 'Продвижение товаров',
          inventory: 'Остатки/прогнозирование поставок',
          pricing: 'Управление ценами',
          efficiency: 'Замер эффективности',
          seo: 'Сбор семантического ядра (SEO)',
          automation: 'Автоматизация ответов'
        });
        resultsHtml += processList('automationProcesses', 'Какие процессы автоматизировать', {
          analytics: 'Аналитика',
          market_analysis: 'Внешняя аналитика',
          promotion: 'Продвижение',
          inventory: 'Остатки/прогноз',
          pricing: 'Управление ценами',
          efficiency: 'Замер эффективности',
          seo: 'Сбор семантического ядра (SEO)',
          automation: 'Автоматизация ответов'
        });
        resultsHtml += processList('supportProcess', 'Поддержка продаж', {
          reviews: 'Работа с отзывами',
          logistics: 'Оптимизация логистики',
          promotion: 'Продвижение',
          pricing: 'Автоматическое управление ценами',
          reporting: 'Финансовая отчетность',
          efficiency: 'Замер эффективности'
        });
        resultsHtml += processList('newArticles', 'Новые артикулы', {
          market_analysis: 'Внешняя аналитика',
          description: 'Быстрое создание описания',
          suppliers: 'Поиск поставщиков',
          calculator: 'Калькулятор прибыльности'
        });
        resultsHtml += processList('matrixOptimization', 'Оптимизация матрицы', {
          analysis: 'Анализ товарной матрицы',
          economics: 'Юнит-экономика',
          seo: 'Проверка SEO'
        });
      } else if (workFormat === 'delegate') {
        // Обработка полей для делегирования
        const productType = formData.get('productType');
        let productText = '';
        if (productType) {
          productText = productType === 'manufacturer' ? 'Производитель' : 'Дистрибьютор';
          const productDescription = formData.get('productDescription');
          if (productDescription) productText += ` (${productDescription})`;
          resultsHtml += `<div class="results-item">
            <div class="results-label">Тип товара:</div>
            <div class="results-value">${productText}</div>
          </div>`;
        }
        const mapMarketplace = { ozon: 'Ozon', wildberries: 'Wildberries', yandex: 'Яндекс Маркет', lamoda: 'Ламода', magnit: 'Магнит Маркет' };
        const getMappedList = (selector) =>
          Array.from(form.querySelectorAll(selector + ':checked'))
               .map(cb => mapMarketplace[cb.value] || cb.value)
               .join(', ');
        
        resultsHtml += `<div class="results-item">
          <div class="results-label">Маркетплейсы (сейчас):</div>
          <div class="results-value">${getMappedList('input[name="currentMarketplacesDelegate"]')}</div>
        </div>`;
        resultsHtml += `<div class="results-item">
          <div class="results-label">Маркетплейсы (план):</div>
          <div class="results-value">${getMappedList('input[name="plannedMarketplacesDelegate"]')}</div>
        </div>`;
        
        const positionsCount = formData.get('positionsCount');
        if (positionsCount) {
          let positionsText = '';
          switch (positionsCount) {
            case 'less_5': positionsText = 'Менее 5'; break;
            case '6_50': positionsText = 'От 6 до 50'; break;
            case '51_100': positionsText = 'От 51 до 100'; break;
            case '101_150': positionsText = 'От 101 до 150'; break;
            case 'more_150': 
              positionsText = 'Более 150 позиций';
              const details = formData.get('positionsCountDetails');
              if(details) positionsText += ` (${details})`;
              break;
          }
          resultsHtml += `<div class="results-item">
            <div class="results-label">Количество позиций:</div>
            <div class="results-value">${positionsText}</div>
          </div>`;
        }
        
        resultsHtml += `<div class="results-item">
          <div class="results-label">Расширение матрицы:</div>
          <div class="results-value">${formData.get('matrixExpansion') === 'yes' ? 'Да' : 'Нет'}</div>
        </div>`;
        resultsHtml += `<div class="results-item">
          <div class="results-label">Процесс работы:</div>
          <div class="results-value">${
            (() => {
              const mpProcess = formData.get('marketplaceProcess');
              if (mpProcess === 'other') {
                const otherVal = formData.get('otherProcessDetails');
                return otherVal ? `Другое (${otherVal})` : 'Другое';
              }
              const mapVal = { staff: 'Сотрудник/ки в штате', outsourcing: 'Аутсорсинг', self: 'Веду самостоятельно' };
              return mapVal[mpProcess] || mpProcess;
            })()
          }</div>
        </div>`;
      }
  
      // Добавляем контактную информацию
      ['name', 'email', 'phone'].forEach(field => {
        const value = formData.get(field);
        if (value) {
          const label = field === 'name' ? 'Имя' : field === 'email' ? 'Email' : 'Телефон';
          resultsHtml += `<div class="results-item">
            <div class="results-label">${label}:</div>
            <div class="results-value">${value}</div>
          </div>`;
        }
      });
      resultsHtml += `</div>`;
      return resultsHtml;
    };
  
    // Отображение результатов в модальном окне
    const displayResultsModal = (resultsHtml) => {
      const oldModal = document.querySelector('.results-modal');
      if (oldModal) oldModal.remove();
  
      const modal = document.createElement('div');
      modal.className = 'results-modal';
  
      const content = document.createElement('div');
      content.className = 'results-modal-content';
  
      const header = document.createElement('div');
      header.className = 'results-modal-header';
      const title = document.createElement('h2');
      title.textContent = 'Результаты опроса';
      const closeButton = document.createElement('button');
      closeButton.className = 'results-modal-close';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', () => modal.remove());
      header.append(title, closeButton);
  
      const resultsContainer = document.createElement('div');
      resultsContainer.className = 'results-modal-body';
      resultsContainer.innerHTML = resultsHtml;
  
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'results-modal-actions';
      const copyButton = document.createElement('button');
      copyButton.className = 'results-modal-button copy-button';
      copyButton.textContent = 'Копировать результаты';
      copyButton.addEventListener('click', () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = resultsHtml;
        const textToCopy = tempDiv.innerText;
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            const notification = document.createElement('div');
            notification.className = 'results-notification';
            notification.textContent = 'Результаты скопированы в буфер обмена';
            document.body.append(notification);
            setTimeout(() => notification.remove(), 2000);
          })
          .catch(err => {
            console.error('Ошибка при копировании: ', err);
            alert('Не удалось скопировать результаты.');
          });
      });
      const newTabButton = document.createElement('button');
      newTabButton.className = 'results-modal-button new-tab-button';
      newTabButton.textContent = 'Открыть в новой вкладке';
      newTabButton.addEventListener('click', () => {
        const newWindow = window.open('', '_blank');
        if(newWindow) {
          newWindow.document.write(`<!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Результаты опроса</title>
              <style>
                body { font-family: Arial, sans-serif; background: #000; color: #fff; padding: 20px; }
                .results-item { display: flex; margin: 10px 0; }
                .results-label { width: 40%; font-weight: bold; }
                .results-value { width: 60%; }
              </style>
            </head>
            <body>
              <h1>Результаты опроса</h1>
              ${resultsHtml}
            </body>
            </html>`);
          newWindow.document.close();
        } else {
          alert('Не удалось открыть новое окно.');
        }
      });
      actionsDiv.append(copyButton, newTabButton);
  
      content.append(header, resultsContainer, actionsDiv);
      modal.appendChild(content);
      document.body.appendChild(modal);
      modal.scrollIntoView({ behavior: 'smooth' });
    };
  
    // Обработка отправки формы
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const resultsHtml = createResultsTable(formData);
      if (resultsHtml) {
        displayResultsModal(resultsHtml);
      } else {
        alert('Ошибка при обработке формы.');
      }
    });
  });
  