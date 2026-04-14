const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

(() => {
  // Helper to safely add event listener
  const safeAddListener = (id, type, handler) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(type, handler);
      return el;
    }
    return null;
  };

  const packageGrid = document.getElementById('packageGrid');
  const searchInput = document.getElementById('searchInput');

  // Search logic
  if (searchInput && packageGrid) {
    searchInput.addEventListener('input', ({ target: { value = '' }}) => {
      const cards = packageGrid.querySelectorAll('.package-card');
      const searchStr = value.toLowerCase();
      cards.forEach(card => {
        const matches = 
          card.dataset.packageName?.toLowerCase().includes(searchStr) ||
          card.dataset.packageId?.toLowerCase().includes(searchStr);
        
        card.style.display = matches ? 'flex' : 'none';
      });
    });
  }

  // Help dialog
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  safeAddListener('urlBarHelp', 'click', () => {
    if (addListingToVccHelp) addListingToVccHelp.show();
  });

  // Copy listing URL
  safeAddListener('vccListingInfoUrlFieldCopy', 'click', async () => {
    const vccUrlField = document.getElementById('vccListingInfoUrlField');
    const copyButton = document.getElementById('vccListingInfoUrlFieldCopy');
    if (vccUrlField) {
      await navigator.clipboard.writeText(vccUrlField.value);
      
      // Simple visual feedback
      if (copyButton) {
        const icon = copyButton.querySelector('.material-icons-outlined');
        if (icon) {
          const oldIcon = icon.textContent;
          icon.textContent = 'check';
          setTimeout(() => { icon.textContent = oldIcon; }, 2000);
        }
      }
    }
  });

  // Add Repo to VCC
  const addRepoHandler = () => {
    window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
  };

  safeAddListener('vccAddRepoButton', 'click', addRepoHandler);

  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach(button => {
    button.addEventListener('click', addRepoHandler);
  });

  // Package info modal
  const packageInfoModal = document.getElementById('packageInfoModal');
  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');

  const rowPackageInfoButtons = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButtons.forEach(button => {
    button.addEventListener('click', () => {
      const packageId = button.dataset.packageId;
      const info = PACKAGES[packageId];
      if (!info || !packageInfoModal) return;

      if (packageInfoName) packageInfoName.textContent = info.displayName;
      if (packageInfoId) packageInfoId.textContent = info.name;
      if (packageInfoVersion) packageInfoVersion.label = `v${info.version}`;
      if (packageInfoDescription) packageInfoDescription.textContent = info.description;
      if (packageInfoAuthor) {
        packageInfoAuthor.innerHTML = `${info.author.name} <span class="material-icons-outlined">open_in_new</span>`;
        packageInfoAuthor.href = info.author.url;
      }

      // Dependencies
      if (packageInfoDependencies) {
        packageInfoDependencies.innerHTML = '';
        const deps = Object.entries(info.dependencies);
        const depSection = document.getElementById('dependenciesSection');
        if (deps.length > 0) {
          if (depSection) depSection.classList.remove('hidden');
          deps.forEach(([name, version]) => {
            const li = document.createElement('li');
            li.textContent = `${name} @ ${version}`;
            packageInfoDependencies.appendChild(li);
          });
        } else {
          if (depSection) depSection.classList.add('hidden');
        }
      }

      // Keywords
      if (packageInfoKeywords) {
        packageInfoKeywords.innerHTML = '';
        const kwSection = document.getElementById('keywordsSection');
        if (info.keywords.length > 0) {
          if (kwSection) kwSection.classList.remove('hidden');
          info.keywords.forEach(kw => {
            const chip = document.createElement('md-assist-chip');
            chip.label = kw;
            packageInfoKeywords.appendChild(chip);
          });
        } else {
          if (kwSection) kwSection.classList.add('hidden');
        }
      }

      // License
      if (packageInfoLicense) {
        const licSection = document.getElementById('licenseSection');
        if (info.license) {
          if (licSection) licSection.classList.remove('hidden');
          packageInfoLicense.innerHTML = `${info.license} <span class="material-icons-outlined">policy</span>`;
          packageInfoLicense.href = info.licensesUrl || '#';
        } else {
          if (licSection) licSection.classList.add('hidden');
        }
      }

      packageInfoModal.show();
    });
  });

  // Modal close buttons
  safeAddListener('packageInfoModalClose', 'click', () => {
    if (packageInfoModal) packageInfoModal.close();
  });
  safeAddListener('addListingToVccHelpClose', 'click', () => {
    if (addListingToVccHelp) addListingToVccHelp.close();
  });

  // Download logic
  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const url = button.dataset.packageUrl;
      if (url) window.open(url, '_blank');
    });
  });

})();
