// services/emailService.js
const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');

class EmailService {
  constructor() {
    // Initialize transporter based on environment
    this.transporter = process.env.NODE_ENV === 'production' 
      ? this.createProductionTransport()
      : this.createDevTransport();
      
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`;
  }

  createProductionTransport() {
    // Configure production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  createDevTransport() {
    // Use mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Release-related notifications
  async sendReleaseNotification(email, release) {
    const movieTitle = release.movie.title;
    const releaseDate = new Date(release.releaseDate).toLocaleDateString();
    
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/releaseNotification.pug'),
      {
        movieTitle,
        releaseDate,
        trailerDate: release.trailerDate ? new Date(release.trailerDate).toLocaleDateString() : null,
        previewLink: `/movies/${release.movie._id}`
      }
    );

    await this.sendEmail({
      to: email,
      subject: `🎬 Coming Soon: ${movieTitle}`,
      html,
      text: `${movieTitle} is releasing on ${releaseDate}. Don't miss it!`
    });
  }

  // Trailer notifications
  async sendTrailerNotification(email, movie) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/trailerNotification.pug'),
      {
        movieTitle: movie.title,
        trailerUrl: movie.trailerUrl,
        movieLink: `/movies/${movie._id}`
      }
    );

    await this.sendEmail({
      to: email,
      subject: `🎥 New Trailer: ${movie.title}`,
      html,
      text: `The trailer for ${movie.title} is now available! Watch it here: ${movie.trailerUrl}`
    });
  }

  // News notifications
  async sendNewsDigest(email, news) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/newsDigest.pug'),
      {
        newsItems: news,
        unsubscribeLink: '/preferences/notifications'
      }
    );

    await this.sendEmail({
      to: email,
      subject: '🎭 Your Movie News Digest',
      html,
      text: news.map(item => `${item.title}\n${item.summary}\n\n`).join('')
    });
  }

  // Discussion notifications
  async sendDiscussionReply(email, discussion, reply) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/discussionReply.pug'),
      {
        discussionTitle: discussion.title,
        replyAuthor: reply.author.name,
        replyContent: reply.content,
        discussionLink: `/discussions/${discussion._id}`
      }
    );

    await this.sendEmail({
      to: email,
      subject: `💬 New Reply in: ${discussion.title}`,
      html,
      text: `${reply.author.name} replied to your discussion: ${discussion.title}\n\n${reply.content}`
    });
  }

  // Award notifications
  async sendAwardNotification(email, movie, award) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/awardNotification.pug'),
      {
        movieTitle: movie.title,
        awardName: award.name,
        category: award.category,
        type: award.type,
        movieLink: `/movies/${movie._id}`
      }
    );

    await this.sendEmail({
      to: email,
      subject: `🏆 ${movie.title} ${award.type === 'winner' ? 'Won' : 'Nominated for'} ${award.name}`,
      html,
      text: `${movie.title} has been ${award.type === 'winner' ? 'awarded' : 'nominated for'} ${award.name} in the category of ${award.category}!`
    });
  }

  // Weekly recommendations
  async sendWeeklyRecommendations(email, recommendations) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/weeklyRecommendations.pug'),
      {
        recommendations,
        preferencesLink: '/preferences'
      }
    );

    await this.sendEmail({
      to: email,
      subject: '🎯 Your Weekly Movie Recommendations',
      html,
      text: recommendations.map(movie => 
        `${movie.title} (${movie.rating}/10) - ${movie.summary}\n\n`
      ).join('')
    });
  }

  // Box office updates
  async sendBoxOfficeUpdate(email, boxOfficeData) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/boxOfficeUpdate.pug'),
      {
        movies: boxOfficeData,
        weekEndDate: new Date().toLocaleDateString()
      }
    );

    await this.sendEmail({
      to: email,
      subject: '📊 Weekend Box Office Update',
      html,
      text: boxOfficeData.map(movie => 
        `${movie.title}: $${movie.earnings.toLocaleString()}\n`
      ).join('')
    });
  }
}

module.exports = new EmailService();

// Example email template (views/emails/releaseNotification.pug)
/*
doctype html
html
  head
    style
      include style.css
  body
    .container
      h1 New Release Coming Soon!
      h2= movieTitle
      p Release Date: #{releaseDate}
      if trailerDate
        p Trailer Date: #{trailerDate}
      .cta
        a.button(href=previewLink) View Details
      .footer
        p You received this email because you subscribed to release notifications.
        small
          a(href="/preferences/notifications") Manage Notification Preferences
*/


/*// services/emailService.js
const nodemailer = require('nodemailer');

exports.sendReleaseNotification = async (email, release) => {
  // Configure your email transport here
  const transporter = nodemailer.createTransport({
    // Add your email service configuration
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Upcoming Release: ${release.movie.title}`,
    html: `
      <h1>New Release Coming Soon!</h1>
      <p>Get ready for ${release.movie.title}</p>
      <p>Release Date: ${release.releaseDate}</p>
      ${release.trailerDate ? `<p>Trailer Date: ${release.trailerDate}</p>` : ''}
    `
  });
};
*/