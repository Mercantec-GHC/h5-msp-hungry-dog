{# Forside til print-siden (/hele-sitet/). Billede mellem titel og metadataboks. #}
<div class="print-cover-meta">

{% if config.site_name %}
<h1 class="print-cover-title">{{ config.site_name }}</h1>
{% endif %}

<div class="print-cover-visual">
    <img
        src="../assets/Datahouse-Frontpage.png"
        alt=""
        class="print-cover-hero-img"
        width="1600"
        height="1067"
        decoding="async"
    />
</div>

<table class="print-cover-table">

    {% if config.site_description %}
    <tr>
        <td>Beskrivelse</td>
        <td>{{ config.site_description }}</td>
    </tr>
    {% endif %}

    {% if config.site_author %}
    <tr>
        <td>Forfatter(e)</td>
        <td>{{ config.site_author }}</td>
    </tr>
    {% endif %}

    {% if config.repo_url %}
    <tr>
        <td>Repository</td>
        <td><a href="{{ config.repo_url }}">{{ config.repo_url }}</a></td>
    </tr>
    {% endif %}

    {% if config.copyright %}
    <tr>
        <td>Copyright</td>
        <td>{{ config.copyright }}</td>
    </tr>
    {% endif %}

</table>

</div>
