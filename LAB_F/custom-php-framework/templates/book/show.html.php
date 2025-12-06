<?php
/** @var \App\Model\Book $book */
/** @var \App\Service\Router $router */

$title = "{$book->getTitle()} ({$book->getId()})";
$bodyClass = 'book-show';

ob_start(); ?>
    <h1><?= htmlspecialchars($book->getTitle()) ?></h1>
    <h2>Author: <?= htmlspecialchars($book->getAuthor()) ?></h2>

    <article>
        <?= nl2br(htmlspecialchars($book->getDescription())); ?>
    </article>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('book-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('book-edit', ['id' => $book->getId()]) ?>">Edit</a></li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
