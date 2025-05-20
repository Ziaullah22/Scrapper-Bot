const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vinted')
    .setDescription('Scrapes Vinted and shows 5 latest shirt items'),

  async execute(interaction) {
    await interaction.reply('🕵️ Scraping Vinted for shirts...');

    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set realistic user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      await page.goto('https://www.vinted.com/vetements?search_text=shirt', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait longer for items to load and scroll to trigger lazy loading
      await page.waitForSelector('.feed-grid__item', { timeout: 10000 });
      await page.evaluate(() => window.scrollBy(0, 500));
      await new Promise(resolve => setTimeout(resolve, 2000));

      const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.feed-grid__item')).slice(0, 5).map(item => {
          // More resilient selector combinations
          const title = item.querySelector('.feed-grid__item-title, [data-testid*="title"], .ItemBox_title__FgPQE')?.innerText.trim() || 'No title';
          const price = item.querySelector('.feed-grid__item-price, [data-testid*="price"], .ItemBox_price__I9D7E')?.innerText.trim() || 'No price';
          
          // Improved link extraction
          const linkElement = item.querySelector('a[href*="/items/"], a[href*="/catalog/"]');
          const href = linkElement?.getAttribute('href') || '';
          const link = href.startsWith('http') ? href : `https://www.vinted.com${href}`;
          
          // Better image handling
          const imgEl = item.querySelector('img');
          const image = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-testid')?.includes('image') && imgEl.src || null;

          return { title, price, link, image };
        });
      });

      await browser.close();

      if (products.length === 0) {
        await interaction.followUp('❌ No shirts found. Vinted might have changed their page structure.');
        return;
      }

      for (const product of products) {
        const embed = new EmbedBuilder()
          .setTitle(product.title)
          .setURL(product.link)
          .setColor(0x00bfa6)
          .setDescription(`💰 **${product.price}**`);

        if (product.image) {
          embed.setImage(product.image);
        }

        await interaction.followUp({ embeds: [embed] });
      }
    } catch (error) {
      console.error('❌ Scraping error:', error);
      await interaction.followUp('❌ Failed to scrape Vinted. Please try again later.');
      if (browser) await browser.close();
    }
  }
};