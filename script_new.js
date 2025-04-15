// Проверяем, что DOM полностью загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('Инициализация скрипта');
    
    const form = document.getElementById('clientForm');
    const resultModal = document.getElementById('resultsModal');
    const resultContainer = document.getElementById('surveyResults');
    const copyBtn = document.getElementById('copyResults');
    const closeBtn = document.getElementById('closeModal');

    // Проверяем наличие всех необходимых элементов
    if (!form || !resultModal || !resultContainer || !copyBtn || !closeBtn) {
        console.error('Не найдены необходимые элементы:', {
            form: !!form,
            resultModal: !!resultModal,
            resultContainer: !!resultContainer,
            copyBtn: !!copyBtn,
            closeBtn: !!closeBtn
        });
        return;
    }

    console.log('Все элементы найдены');

    // Функция для обновления атрибута required
    function updateRequiredFields(section) {
        // Сначала убираем required у всех полей во всех секциях
        document.querySelectorAll('input[required]').forEach(input => {
            input.removeAttribute('required');
        });

        // Затем добавляем required только к видимым полям в активной секции
        if (section) {
            const visibleInputs = section.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])');
            visibleInputs.forEach(input => {
                const parentDiv = input.closest('.text-input');
                if (parentDiv && window.getComputedStyle(parentDiv).display !== 'none') {
                    input.setAttribute('required', 'required');
                }
            });
        }
    }

    // Функция для проверки видимости элемента
    function isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    // Показываем/скрываем секции в зависимости от формата
    document.querySelectorAll('input[name="workFormat"]').forEach(radio => {
        radio.addEventListener('change', () => {
            console.log('Изменен формат работы:', radio.value);
            
            // Скрываем все секции
            const sections = ['selfWorkSection', 'delegateSection', 'marketplaceEntrySection'];
            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'none';
                }
            });

            // Показываем выбранную секцию
            if (radio.checked) {
                const sectionId = {
                    self: 'selfWorkSection',
                    delegate: 'delegateSection',
                    marketplace_entry: 'marketplaceEntrySection'
                }[radio.value];
                
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'block';
                    updateRequiredFields(section);
                } else {
                    console.error('Секция не найдена:', sectionId);
                }
            }
        });
    });

    // Обработка чекбоксов "Другое"
    document.querySelectorAll('input[data-other="true"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const textInput = this.closest('.checkbox-group').nextElementSibling;
            if (textInput && textInput.classList.contains('text-input')) {
                textInput.style.display = this.checked ? 'block' : 'none';
                const inputField = textInput.querySelector('input');
                if (inputField) {
                    if (this.checked) {
                        inputField.setAttribute('required', 'required');
                    } else {
                        inputField.removeAttribute('required');
                        inputField.value = ''; // Очищаем значение при скрытии
                    }
                }
            }
        });
    });

    // Обработка радио-кнопок с дополнительными полями
    document.querySelectorAll('input[name="analyticsServices"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const detailsInput = document.getElementById('analyticsServicesInput');
            if (detailsInput) {
                detailsInput.style.display = this.value === 'yes' ? 'block' : 'none';
                const inputField = detailsInput.querySelector('input[name="analyticsServicesDetails"]');
                if (inputField) {
                    inputField.required = this.value === 'yes';
                }
            }
        });
    });

    // Обработка радио-кнопок с дополнительными полями
    document.querySelectorAll('input[name="positionsCount"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const detailsInput = document.getElementById('positionsCountInput');
            if (detailsInput) {
                detailsInput.style.display = this.value === 'more_150' ? 'block' : 'none';
                const inputField = detailsInput.querySelector('input[name="positionsCountDetails"]');
                if (inputField) {
                    inputField.required = this.value === 'more_150';
                }
            }
        });
    });

    // Обработка радио-кнопок с дополнительными полями
    document.querySelectorAll('input[name="matrixExpansion"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const detailsInput = document.getElementById('expansionDetailsInput');
            if (detailsInput) {
                detailsInput.style.display = this.value === 'yes' ? 'block' : 'none';
                const inputField = detailsInput.querySelector('input[name="expansionDetails"]');
                if (inputField) {
                    inputField.required = this.value === 'yes';
                }
            }
        });
    });

    document.querySelectorAll('input[name="marketplaceProcess"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const detailsInput = document.getElementById('otherProcessInput');
            if (detailsInput) {
                detailsInput.style.display = this.value === 'other' ? 'block' : 'none';
                const inputField = detailsInput.querySelector('input[name="otherProcessDetails"]');
                if (inputField) {
                    inputField.required = this.value === 'other';
                }
            }
        });
    });

    // Обработка радио-кнопок с дополнительными полями
    document.querySelectorAll('input[name="workStructureEntry"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const detailsInput = document.getElementById('otherWorkStructureEntryInput');
            if (detailsInput) {
                detailsInput.style.display = this.value === 'other' ? 'block' : 'none';
                const inputField = detailsInput.querySelector('input[name="otherWorkStructureEntry"]');
                if (inputField) {
                    inputField.required = this.value === 'other';
                }
            }
        });
    });

    // Обработчик отправки формы
    document.getElementById('clientForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Проверяем только видимые поля
        const visibleInputs = Array.from(this.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])'))
            .filter(input => {
                const parentDiv = input.closest('.text-input');
                return !parentDiv || window.getComputedStyle(parentDiv).display !== 'none';
            });
            
        const emptyFields = visibleInputs.filter(input => {
            const isRequired = input.hasAttribute('required');
            const isEmpty = !input.value.trim();
            return isRequired && isEmpty;
        });
        
        if (emptyFields.length > 0) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        try {
            // Если все в порядке, собираем и отображаем результаты
            const formData = collectAllResults();
            if (Object.keys(formData).length === 0) {
                alert('Нет данных для отображения');
                return;
            }
            displayResultsModal(formData);
        } catch (error) {
            console.error('Ошибка при обработке формы:', error);
            alert('Произошла ошибка при обработке формы');
        }
    });

    // Добавляем обработчик для экспорта в Excel
    document.getElementById('exportPDF').addEventListener('click', function() {
        const formData = collectAllResults();
        
        // Создаем рабочую книгу Excel
        const wb = XLSX.utils.book_new();
        
        // Преобразуем данные в формат для Excel
        const data = [
            ['Вопрос', 'Ответ'], // Заголовки
            ...Object.entries(formData).map(([question, answer]) => [question, answer])
        ];
        
        // Создаем рабочий лист
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Настраиваем стили для заголовков
        ws['!cols'] = [
            {wch: 40}, // Ширина для колонки вопросов
            {wch: 60}  // Ширина для колонки ответов
        ];
        
        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(wb, ws, "Результаты");
        
        // Сохраняем файл
        XLSX.writeFile(wb, "Результаты опроса.xlsx");
    });

    // Обновляем обработчик копирования
    document.getElementById('copyResults').addEventListener('click', function() {
        const formData = collectAllResults();
        let textToCopy = '';
        
        for (const [question, answer] of Object.entries(formData)) {
            textToCopy += `${question}\n${answer}\n\n`;
        }
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert('Результаты скопированы в буфер обмена'))
            .catch(err => console.error('Ошибка при копировании:', err));
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        resultModal.style.display = 'none';
    });

    // Функция для отображения результатов в модальном окне
    function displayResultsModal(formData) {
        const resultContainer = document.getElementById('surveyResults');
        const modal = document.getElementById('resultsModal');
        
        if (!resultContainer || !modal) {
            console.error('Не найдены элементы для отображения результатов');
            return;
        }

        // Создаем таблицу результатов
        let resultsHtml = '<table class="results-table">';
        resultsHtml += '<thead><tr><th>Вопрос</th><th>Ответ</th></tr></thead><tbody>';
        
        for (const [question, answer] of Object.entries(formData)) {
            resultsHtml += `
                <tr>
                    <td>${question}</td>
                    <td>${answer}</td>
                </tr>`;
        }
        
        resultsHtml += '</tbody></table>';
        
        // Отображаем результаты
        resultContainer.innerHTML = resultsHtml;
        modal.style.display = 'block';
    }

    // Вспомогательные функции
    function getWorkFormatLabel(value) {
        const labels = {
            'self': 'Самостоятельная работа с сервисом',
            'delegate': 'Делегировать ведение магазина нашей команде',
            'marketplace_entry': 'Выход на маркетплейсы под ключ'
        };
        return labels[value] || value;
    }

    function getProductTypeLabel(value) {
        const labels = {
            'manufacturer': 'Производитель',
            'distributor': 'Дистрибьютор'
        };
        return labels[value] || value;
    }

    function getWorkStructureLabel(value) {
        const labels = {
            'staff': 'Сотрудник/ки в штате',
            'outsourcing': 'Аутсорсинг',
            'self': 'Планировал вести самостоятельно',
            'other': 'Другое'
        };
        return labels[value] || value;
    }

    // Функция для сбора всех результатов
    function collectAllResults() {
        let results = {};
        
        try {
            // Собираем информацию о клиенте
            const clientName = document.getElementById('clientName')?.value;
            const companyName = document.getElementById('companyName')?.value;
            
            if (clientName) results['Имя клиента'] = clientName;
            if (companyName) results['Название компании'] = companyName;

            // Получаем выбранный формат работы
            const workFormat = document.querySelector('input[name="workFormat"]:checked');
            if (!workFormat) {
                console.log('Формат работы не выбран');
                return results;
            }
            
            results['Формат работы'] = getWorkFormatLabel(workFormat.value);
            console.log('Выбранный формат работы:', workFormat.value);

            // В зависимости от формата работы собираем соответствующие данные
            switch (workFormat.value) {
                case 'self':
                    collectSelfWorkResults(results);
                    break;
                case 'delegate':
                    collectDelegateResults(results);
                    break;
                case 'marketplace_entry':
                    collectMarketplaceEntryResults(results);
                    break;
            }
        } catch (error) {
            console.error('Ошибка при сборе результатов:', error);
        }

        return results;
    }

    // Функция для создания перетаскиваемого элемента
    function createDraggableItem(text) {
        const item = document.createElement('div');
        item.className = 'priority-item';
        item.draggable = true;
        
        const number = document.createElement('div');
        number.className = 'priority-number';
        
        const textElement = document.createElement('div');
        textElement.className = 'priority-text';
        textElement.textContent = text;
        
        item.appendChild(number);
        item.appendChild(textElement);
        
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', text);
            this.classList.add('dragging');
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            updatePriorityNumbers(this.parentElement);
        });
        
        return item;
    }

    // Функция для обновления нумерации элементов приоритета
    function updatePriorityNumbers(container) {
        const items = container.querySelectorAll('.priority-item');
        items.forEach((item, index) => {
            item.querySelector('.priority-number').textContent = index + 1;
        });
    }

    // Обработчики для перетаскивания
    function setupDragAndDrop(container) {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;
            
            const siblings = [...this.querySelectorAll('.priority-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                const offset = box.top + box.height / 2;
                return e.clientY < offset;
            });
            
            this.insertBefore(draggingItem, nextSibling);
        });
    }

    // Функция для обновления списка приоритетов
    function updatePriorityList(groupId, priorityId) {
        const group = document.getElementById(groupId);
        const priorityContainer = document.getElementById(priorityId);
        
        if (!group || !priorityContainer) return;
        
        priorityContainer.innerHTML = '';
        
        const selectedItems = Array.from(group.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
        
        selectedItems.forEach(text => {
            const item = createDraggableItem(text);
            priorityContainer.appendChild(item);
        });
        
        updatePriorityNumbers(priorityContainer);
    }

    // Обработчики для перетаскивания
    document.querySelectorAll('.priority-group').forEach(container => {
        setupDragAndDrop(container);
    });

    // Обработчики для чекбоксов
    document.querySelectorAll('#supportProcessGroup input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updatePriorityList('supportProcessGroup', 'supportProcessPriority');
        });
    });

    document.querySelectorAll('#newArticlesGroup input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updatePriorityList('newArticlesGroup', 'newArticlesPriority');
        });
    });

    document.querySelectorAll('#matrixOptimizationGroup input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updatePriorityList('matrixOptimizationGroup', 'matrixOptimizationPriority');
        });
    });

    // Функция для сбора приоритетов
    function collectPriorities(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        return Array.from(container.querySelectorAll('.priority-item'))
            .map(item => item.querySelector('.priority-text').textContent);
    }

    // Функция для сбора результатов самостоятельной работы
    function collectSelfWorkResults(results) {
        try {
            // Собираем данные о текущих маркетплейсах
            const currentMarketplaces = Array.from(document.querySelectorAll('input[name="currentMarketplaces"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (currentMarketplaces.length > 0) {
                results['Текущие маркетплейсы'] = currentMarketplaces.join(', ');
            }

            // Собираем данные о планируемых маркетплейсах
            const plannedMarketplaces = Array.from(document.querySelectorAll('input[name="plannedMarketplaces"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (plannedMarketplaces.length > 0) {
                results['Планируемые маркетплейсы'] = plannedMarketplaces.join(', ');
            }

            // Собираем данные о сервисах аналитики
            const analyticsService = document.querySelector('input[name="analyticsServices"]:checked');
            if (analyticsService) {
                if (analyticsService.value === 'yes') {
                    const details = document.querySelector('input[name="analyticsServicesDetails"]')?.value;
                    results['Пользуетесь ли каким-то сервисом аналитики?'] = `Да: ${details || ''}`;
                } else {
                    results['Пользуетесь ли каким-то сервисом аналитики?'] = 'Нет, не пользуюсь';
                }
            }

            // Собираем данные о важных блоках
            const importantBlocks = Array.from(document.querySelectorAll('input[name="importantBlocks"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (importantBlocks.length > 0) {
                results['Важные блоки в работе с маркетплейсами'] = importantBlocks.join(', ');
            }

            // Собираем данные о процессах автоматизации
            const automationProcesses = Array.from(document.querySelectorAll('input[name="automationProcesses"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (automationProcesses.length > 0) {
                results['Процессы для автоматизации'] = automationProcesses.join(', ');
            }

            // Собираем приоритеты для процесса поддержки продаж
            const supportProcessPriorities = collectPriorities('supportProcessPriority');
            if (supportProcessPriorities.length > 0) {
                results['Приоритеты процесса поддержки продаж'] = supportProcessPriorities.map((item, index) => 
                    `${index + 1}. ${item}`
                ).join('\n');
            }

            // Собираем приоритеты для новых артикулов
            const newArticlesPriorities = collectPriorities('newArticlesPriority');
            if (newArticlesPriorities.length > 0) {
                results['Приоритеты внедрения новых артикулов'] = newArticlesPriorities.map((item, index) => 
                    `${index + 1}. ${item}`
                ).join('\n');
            }

            // Собираем приоритеты для оптимизации матрицы
            const matrixOptimizationPriorities = collectPriorities('matrixOptimizationPriority');
            if (matrixOptimizationPriorities.length > 0) {
                results['Приоритеты оптимизации матрицы'] = matrixOptimizationPriorities.map((item, index) => 
                    `${index + 1}. ${item}`
                ).join('\n');
            }

            // Собираем ранжированные возможности
            const possibilities = [];
            for (let i = 1; i <= 3; i++) {
                const possibility = document.querySelector(`input[name="possibility${i}"]`)?.value;
                if (possibility) {
                    possibilities.push(possibility);
                }
            }
            
            if (possibilities.length > 0) {
                results['Ранжированные возможности'] = possibilities.map((p, i) => `${i + 1}. ${p}`).join('\n');
            }
        } catch (error) {
            console.error('Ошибка при сборе результатов самостоятельной работы:', error);
        }
    }

    // Функция для сбора результатов делегирования
    function collectDelegateResults(results) {
        try {
            const productType = document.querySelector('input[name="productType"]:checked');
            const productDescription = document.querySelector('input[name="productDescription"]')?.value;
            
            if (productType && productDescription) {
                results['С каким товаром работаете?'] = 
                    `${getProductTypeLabel(productType.value)}: ${productDescription}`;
            }

            // Собираем данные о текущих маркетплейсах
            const currentMarketplaces = Array.from(document.querySelectorAll('input[name="currentMarketplacesDelegate"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (currentMarketplaces.length > 0) {
                results['Текущие маркетплейсы'] = currentMarketplaces.join(', ');
            }

            // Собираем данные о планируемых маркетплейсах
            const plannedMarketplaces = Array.from(document.querySelectorAll('input[name="plannedMarketplacesDelegate"]:checked'))
                .map(input => input.nextElementSibling.textContent.trim());
            if (plannedMarketplaces.length > 0) {
                results['Планируемые маркетплейсы'] = plannedMarketplaces.join(', ');
            }

            // Собираем данные о количестве позиций
            const positionsCount = document.querySelector('input[name="positionsCount"]:checked');
            if (positionsCount) {
                if (positionsCount.value === 'more_150') {
                    const details = document.querySelector('input[name="positionsCountDetails"]')?.value;
                    results['Количество продаваемых позиций'] = `Более 150 позиций: ${details || ''}`;
                } else {
                    results['Количество продаваемых позиций'] = positionsCount.nextElementSibling.textContent.trim();
                }
            }

            // Собираем данные о расширении матрицы
            const matrixExpansion = document.querySelector('input[name="matrixExpansion"]:checked');
            if (matrixExpansion) {
                if (matrixExpansion.value === 'yes') {
                    const details = document.querySelector('input[name="expansionDetails"]')?.value;
                    results['Планируете расширение матрицы?'] = `Да: ${details || ''}`;
                } else {
                    results['Планируете расширение матрицы?'] = 'Нет';
                }
            }

            // Собираем данные о процессе работы
            const marketplaceProcess = document.querySelector('input[name="marketplaceProcess"]:checked');
            if (marketplaceProcess) {
                if (marketplaceProcess.value === 'other') {
                    const details = document.querySelector('input[name="otherProcessDetails"]')?.value;
                    results['Как выстроен процесс работы с маркетплейсами?'] = `Другое: ${details || ''}`;
                } else {
                    results['Как выстроен процесс работы с маркетплейсами?'] = marketplaceProcess.nextElementSibling.textContent.trim();
                }
            }
        } catch (error) {
            console.error('Ошибка при сборе результатов делегирования:', error);
        }
    }

    // Функция для сбора результатов выхода на маркетплейсы
    function collectMarketplaceEntryResults(results) {
        try {
            const targetMarketplaces = document.querySelector('input[name="targetMarketplaces"]')?.value;
            if (targetMarketplaces) {
                results['На какие площадки планируете выходить?'] = targetMarketplaces;
            }

            const productType = document.querySelector('input[name="productTypeEntry"]:checked');
            if (productType) {
                results['С каким товаром хотите работать?'] = 
                    `${getProductTypeLabel(productType.value)}: ${document.querySelector('input[name="productDescriptionEntry"]')?.value || ''}`;
            }

            // Собираем данные о структуре работы
            const workStructure = document.querySelector('input[name="workStructureEntry"]:checked');
            if (workStructure) {
                if (workStructure.value === 'other') {
                    const details = document.querySelector('input[name="otherWorkStructureEntry"]')?.value;
                    results['Как будет строиться работа с маркетплейсами?'] = `Другое: ${details || ''}`;
                } else {
                    results['Как будет строиться работа с маркетплейсами?'] = workStructure.nextElementSibling.textContent.trim();
                }
            }
        } catch (error) {
            console.error('Ошибка при сборе результатов выхода на маркетплейсы:', error);
        }
    }

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        // Инициализация перетаскивания для всех контейнеров приоритетов
        document.querySelectorAll('.priority-group').forEach(container => {
            setupDragAndDrop(container);
        });

        // Обработчики для чекбоксов
        document.querySelectorAll('#supportProcessGroup input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePriorityList('supportProcessGroup', 'supportProcessPriority');
            });
        });

        document.querySelectorAll('#newArticlesGroup input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePriorityList('newArticlesGroup', 'newArticlesPriority');
            });
        });

        document.querySelectorAll('#matrixOptimizationGroup input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePriorityList('matrixOptimizationGroup', 'matrixOptimizationPriority');
            });
        });
    });

    // Обработчик клика вне модального окна для его закрытия
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('resultsModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
